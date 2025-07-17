const bloggerService = require('../services/bloggerService');

const getComments = async (req, res) => {
  try {
    const { blogId, postId, status } = req.query;
    
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

    const result = await bloggerService.getComments(targetBlogId, postId, req.user.id);
    let comments = result.items || [];

    // Apply status filter if provided
    if (status && status !== 'all') {
      comments = comments.filter(comment => 
        comment.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Transform comments for frontend
    const transformedComments = comments.map(comment => ({
      id: comment.id,
      author: comment.author?.displayName || 'Anonymous',
      email: comment.author?.email || 'no-email@example.com',
      content: comment.content,
      postTitle: comment.post?.title || 'Unknown Post',
      postId: comment.post?.id || postId,
      date: comment.published,
      status: comment.status ? comment.status.toLowerCase() : 'unknown',
      website: comment.author?.url || null,
      inReplyTo: comment.inReplyTo || null
    }));

    res.json({
      success: true,
      data: transformedComments,
      message: 'Comments fetched successfully'
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
};

const updateCommentStatus = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { status, blogId, postId } = req.body;
    
    // Set current user in service
    bloggerService.setCurrentUser(req.user.id);
    
    // Get user's blogs first if no blogId provided
    let targetBlogId = blogId;
    let targetPostId = postId;
    
    if (!targetBlogId || !targetPostId) {
      const blogs = await bloggerService.getBlogs(req.user.id);
      if (blogs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No blogs found for this user'
        });
      }
      targetBlogId = targetBlogId || blogs[0].blogId;
      
      // If no postId, we need to find it from the comment
      if (!targetPostId) {
        const allComments = await bloggerService.getComments(targetBlogId, null, req.user.id);
        const comment = allComments.items?.find(c => c.id === commentId);
        if (comment && comment.post) {
          targetPostId = comment.post.id;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Post ID is required for comment operations'
          });
        }
      }
    }

    await bloggerService.updateCommentStatus(targetBlogId, targetPostId, commentId, status, req.user.id);

    res.json({
      success: true,
      message: `Comment ${status} successfully`
    });

  } catch (error) {
    console.error('Update comment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment status',
      error: error.message
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { blogId, postId } = req.query;
    
    // Set current user in service
    bloggerService.setCurrentUser(req.user.id);
    
    // Get user's blogs first if no blogId provided
    let targetBlogId = blogId;
    let targetPostId = postId;
    
    if (!targetBlogId || !targetPostId) {
      const blogs = await bloggerService.getBlogs(req.user.id);
      if (blogs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No blogs found for this user'
        });
      }
      targetBlogId = targetBlogId || blogs[0].blogId;
      
      // If no postId, we need to find it from the comment
      if (!targetPostId) {
        const allComments = await bloggerService.getComments(targetBlogId, null, req.user.id);
        const comment = allComments.items?.find(c => c.id === commentId);
        if (comment && comment.post) {
          targetPostId = comment.post.id;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Post ID is required for comment operations'
          });
        }
      }
    }

    await bloggerService.deleteComment(targetBlogId, targetPostId, commentId, req.user.id);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};

module.exports = {
  getComments,
  updateCommentStatus,
  deleteComment
};