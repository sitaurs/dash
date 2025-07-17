const bloggerService = require('../services/bloggerService');
const Blog = require('../models/Blog');

const getBlogs = async (req, res) => {
  try {
    // Set current user in service
    bloggerService.setCurrentUser(req.user.id);
    
    // Get blogs with better error handling
    let blogs;
    try {
      blogs = await bloggerService.getBlogs(req.user.id);
    } catch (apiError) {
      // If API fails, try to get cached blogs from database
      console.warn('Blogger API failed, trying cache:', apiError.message);
      
      const cachedBlogs = await Blog.findByUser(req.user.id);
      if (cachedBlogs.length > 0) {
        return res.json({
          success: true,
          data: cachedBlogs.map(blog => blog.toSummary()),
          message: 'Blogs loaded from cache (API temporarily unavailable)',
          cached: true,
          error: apiError.message
        });
      }
      
      // If no cache available, return the original error
      throw apiError;
    }
    
    res.json({
      success: true,
      data: blogs,
      message: `Successfully fetched ${blogs.length} blog(s) from Blogger API`
    });

  } catch (error) {
    console.error('Get blogs error:', error);

    // Enhanced error response
    let statusCode = 500;
    let message = 'Failed to fetch blogs';
    
    if (error.message.includes('Authentication failed')) {
      statusCode = 401;
      message = 'Please re-authorize with Google to access your blogs';
    } else if (error.message.includes('Access denied')) {
      statusCode = 403;
      message = 'Access denied. Please check your Blogger permissions';
    } else if (error.message.includes('No blogs found')) {
      statusCode = 404;
      message = 'No blogs found. Please create a blog on Blogger.com first';
    }
    
    res.status(statusCode).json({
      success: false,
      message: message,
      error: error.message
    });
  }
};

const getBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    
    // Set current user in service
    bloggerService.setCurrentUser(req.user.id);
    
    // Fetch specific blog
    const blog = await bloggerService.getBlog(blogId, req.user.id);
    
    res.json({
      success: true,
      data: blog,
      message: 'Blog fetched successfully'
    });

  } catch (error) {
    console.error('Get blog error:', error);
    
    // Try to get cached blog from database if API fails
    try {
      const cachedBlog = await Blog.findOne({ 
        blogId: req.params.blogId, 
        userId: req.user.id 
      });
      
      if (cachedBlog) {
        return res.json({
          success: true,
          data: cachedBlog,
          message: 'Blog fetched from cache (API temporarily unavailable)',
          cached: true
        });
      }
    } catch (dbError) {
      console.error('Database fallback error:', dbError);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message
    });
  }
};

const syncBlogs = async (req, res) => {
  try {
    // Set current user in service
    bloggerService.setCurrentUser(req.user.id);
    
    // Force sync blogs from API
    const blogs = await bloggerService.getBlogs(req.user.id);
    
    res.json({
      success: true,
      data: blogs,
      message: `Successfully synced ${blogs.length} blog(s)`,
      syncedAt: new Date()
    });

  } catch (error) {
    console.error('Sync blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync blogs',
      error: error.message
    });
  }
};

module.exports = {
  getBlogs,
  getBlog,
  syncBlogs
};