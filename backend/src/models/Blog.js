const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  blogId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['LIVE', 'DELETED'],
    default: 'LIVE'
  },
  locale: {
    country: String,
    language: String,
    variant: String
  },
  posts: {
    totalItems: {
      type: Number,
      default: 0
    },
    selfLink: String
  },
  pages: {
    totalItems: {
      type: Number,
      default: 0
    },
    selfLink: String
  },
  published: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSynced: {
    type: Date,
    default: Date.now
  },
  // Additional metadata from Blogger API
  customMetaData: {
    type: String,
    default: ''
  },
  selfLink: String
}, {
  timestamps: true
});

// Compound index for performance
blogSchema.index({ userId: 1, isActive: 1 });
blogSchema.index({ blogId: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ lastSynced: 1 });

// Static method to find blogs by user
blogSchema.statics.findByUser = function(userId) {
  return this.find({ userId: userId, isActive: true }).sort({ lastSynced: -1 });
};

// Static method to create or update blog from Blogger API data
blogSchema.statics.createOrUpdateFromBloggerData = async function(userId, bloggerData) {
  const existingBlog = await this.findOne({ 
    blogId: bloggerData.id, 
    userId: userId 
  });
  
  const blogData = {
    blogId: bloggerData.id,
    name: bloggerData.name,
    description: bloggerData.description || '',
    url: bloggerData.url,
    status: bloggerData.status,
    locale: bloggerData.locale,
    posts: bloggerData.posts,
    pages: bloggerData.pages,
    published: new Date(bloggerData.published),
    updated: new Date(bloggerData.updated),
    userId: userId,
    lastSynced: new Date(),
    customMetaData: bloggerData.customMetaData || '',
    selfLink: bloggerData.selfLink
  };
  
  if (existingBlog) {
    // Update existing blog
    Object.assign(existingBlog, blogData);
    await existingBlog.save();
    console.log('✅ Blog updated:', existingBlog.name);
    return existingBlog;
  } else {
    // Create new blog
    const newBlog = new this(blogData);
    await newBlog.save();
    console.log('✅ Blog created:', newBlog.name);
    return newBlog;
  }
};

// Method to update sync time
blogSchema.methods.updateSyncTime = async function() {
  this.lastSynced = new Date();
  await this.save();
};

// Method to get blog summary for API responses
blogSchema.methods.toSummary = function() {
  return {
    id: this._id,
    blogId: this.blogId,
    name: this.name,
    description: this.description,
    url: this.url,
    status: this.status,
    posts: this.posts,
    pages: this.pages,
    lastSynced: this.lastSynced
  };
};

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;