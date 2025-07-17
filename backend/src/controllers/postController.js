const bloggerService = require('../services/bloggerService');

const getPosts = async (req, res) => {
  try {
    const { blogId } = req.query;
    const { page = 1, limit = 10, status, search, orderBy = 'published' } = req.query;
    
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

    const options = {
      maxResults: parseInt(limit),
      orderBy: orderBy,
      status: status ? [status] : undefined
    };

    // Add pagination if supported by API
    if (page > 1) {
      // Note: Blogger API uses pageToken, not page numbers
      // This is a simplified implementation
      options.startIndex = (page - 1) * limit;
    }

    const result = await bloggerService.getPosts(targetBlogId, options, req.user.id);
    let posts = result.items || [];

    // Apply search filter if provided
    if (search) {
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Calculate pagination info
    const totalItems = posts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPosts = posts.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        posts: paginatedPosts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems: totalItems,
          hasNext: endIndex < totalItems,
          hasPrev: page > 1,
          nextPageToken: result.nextPageToken || null
        }
      },
      message: 'Posts fetched successfully'
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
};

const getPost = async (req, res) => {
  try {
    const { postId } = req.params;
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

    const post = await bloggerService.getPost(targetBlogId, postId, req.user.id);
    
    res.json({
      success: true,
      data: post,
      message: 'Post fetched successfully'
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: error.message
    });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, labels, isDraft = false } = req.body;
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

    const postData = {
      title,
      content,
      labels: Array.isArray(labels) ? labels : [],
      isDraft
    };

    const newPost = await bloggerService.createPost(targetBlogId, postData, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: newPost
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, labels, isDraft } = req.body;
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

    const postData = {
      title,
      content,
      labels: Array.isArray(labels) ? labels : [],
      isDraft
    };

    const updatedPost = await bloggerService.updatePost(targetBlogId, postId, postData, req.user.id);

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });

  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
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

    await bloggerService.deletePost(targetBlogId, postId, req.user.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

const getPostStats = async (req, res) => {
  try {
    const { postId } = req.params;
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

    const stats = await bloggerService.getPostStats(targetBlogId, postId, req.user.id);

    res.json({
      success: true,
      data: stats,
      message: 'Post statistics fetched successfully'
    });

  } catch (error) {
    console.error('Get post stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post statistics',
      error: error.message
    });
  }
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getPostStats
};