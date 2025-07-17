const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, and documents
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|avi|mov|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, videos, and documents are allowed'));
    }
  }
});

// Content model for MongoDB
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'document'],
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  usedIn: [{
    type: String // Post IDs where this content is used
  }]
}, {
  timestamps: true
});

const Content = mongoose.model('Content', contentSchema);

const uploadFile = async (req, res) => {
  try {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Determine file type
      let fileType = 'document';
      if (req.file.mimetype.startsWith('image/')) {
        fileType = 'image';
      } else if (req.file.mimetype.startsWith('video/')) {
        fileType = 'video';
      }

      // Create file record in database
      const fileRecord = new Content({
        userId: req.user.id,
        name: req.file.filename,
        originalName: req.file.originalname,
        type: fileType,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
        filePath: req.file.path,
        usedIn: []
      });

      await fileRecord.save();

      console.log('📁 File uploaded:', fileRecord.originalName);

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          id: fileRecord._id,
          name: fileRecord.originalName,
          type: fileRecord.type,
          size: formatFileSize(fileRecord.size),
          uploaded: fileRecord.createdAt.toISOString(),
          url: fileRecord.url,
          usedIn: fileRecord.usedIn
        }
      });
    });

  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

const getContent = async (req, res) => {
  try {
    const { type, search } = req.query;
    
    // Build query
    const query = { userId: req.user.id };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const content = await Content.find(query).sort({ createdAt: -1 });

    // Transform data for frontend
    const transformedContent = content.map(item => ({
      id: item._id,
      name: item.originalName,
      type: item.type,
      size: formatFileSize(item.size),
      uploaded: item.createdAt.toISOString(),
      url: item.url,
      usedIn: item.usedIn
    }));

    res.json({
      success: true,
      data: transformedContent
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message
    });
  }
};

const deleteContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    
    // Find content in database
    const content = await Content.findOne({ 
      _id: contentId, 
      userId: req.user.id 
    });
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Delete physical file
    if (fs.existsSync(content.filePath)) {
      fs.unlinkSync(content.filePath);
    }

    // Delete from database
    await Content.deleteOne({ _id: contentId });

    console.log('🗑️  Content deleted:', content.originalName);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content',
      error: error.message
    });
  }
};

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = {
  uploadFile,
  getContent,
  deleteContent
};