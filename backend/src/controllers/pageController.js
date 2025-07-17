const bloggerService = require('../services/bloggerService');

const getPages = async (req, res) => {
  try {
    const { blogId } = req.query;
    
    // Set current user in service
    bloggerService.setCurrentUser(req.user.id);
    
    // Get user's blogs first if no blogId provided
    let targetBlogId = blogId;
    if (!targetBlogId) {
      const blogs = await bloggerService.getBlogs(req.user.id);
      if (blogs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No blogs found for this user'
        });
      }
      targetBlogId = blogs[0].blogId;
    }

    const result = await bloggerService.getPages(targetBlogId, req.user.id);
    const pages = result.items || [];

    res.json({
      success: true,
      data: pages,
      message: 'Pages fetched successfully'
    });

  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pages',
      error: error.message
    });
  }
};

const getPage = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { blogId } = req.query;
    
    // Set current user in service
    bloggerService.setCurrentUser(req.user.id);
    
    // Get user's blogs first if no blogId provided
    let targetBlogId = blogId;
    if (!targetBlogId) {
      const blogs = await bloggerService.getBlogs(req.user.id);
      if (blogs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No blogs found for this user'
        });
      }
      targetBlogId = blogs[0].blogId;
    }

    const page = await bloggerService.getPage(targetBlogId, pageId, req.user.id);
    
    res.json({
      success: true,
      data: page,
      message: 'Page fetched successfully'
    });

  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch page',
      error: error.message
    });
  }
};

const createPage = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { blogId } = req.query;
    
    // Set current user in service
    bloggerService.setCurrentUser(req.user.id);
    
    // Get user's blogs first if no blogId provided
    let targetBlogId = blogId;
    if (!targetBlogId) {
      const blogs = await bloggerService.getBlogs(req.user.id);
      if (blogs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No blogs found for this user'
        });
      }
      targetBlogId = blogs[0].blogId;
    }

    const pageData = {
      title,
      content
    };

    const newPage = await bloggerService.createPage(targetBlogId, pageData, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Page created successfully',
      data: newPage
    });

  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create page',
      error: error.message
    });
  }
};

const updatePage = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { title, content } = req.body;
    const { blogId } = req.query;
    
    // Set current user in service
    bloggerService.setCurrentUser(req.user.id);
    
    // Get user's blogs first if no blogId provided
    let targetBlogId = blogId;
    if (!targetBlogId) {
      const blogs = await bloggerService.getBlogs(req.user.id);
      if (blogs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No blogs found for this user'
        });
      }
      targetBlogId = blogs[0].blogId;
    }

    const pageData = {
      title,
      content
    };

    const updatedPage = await bloggerService.updatePage(targetBlogId, pageId, pageData, req.user.id);

    res.json({
      success: true,
      message: 'Page updated successfully',
      data: updatedPage
    });

  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update page',
      error: error.message
    });
  }
};

const deletePage = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { blogId } = req.query;
    
    // Set current user in service
    bloggerService.setCurrentUser(req.user.id);
    
    // Get user's blogs first if no blogId provided
    let targetBlogId = blogId;
    if (!targetBlogId) {
      const blogs = await bloggerService.getBlogs(req.user.id);
      if (blogs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No blogs found for this user'
        });
      }
      targetBlogId = blogs[0].blogId;
    }

    await bloggerService.deletePage(targetBlogId, pageId, req.user.id);

    res.json({
      success: true,
      message: 'Page deleted successfully'
    });

  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete page',
      error: error.message
    });
  }
};

module.exports = {
  getPages,
  getPage,
  createPage,
  updatePage,
  deletePage
};