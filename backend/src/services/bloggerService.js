const { google } = require('googleapis');
const OAuthToken = require('../models/OAuthToken');
const Blog = require('../models/Blog');
const Post = require('../models/Post');

class BloggerService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    this.blogger = google.blogger({ version: 'v3', auth: this.oauth2Client });
    this.currentUserId = null;
  }

  // Set current user for operations
  setCurrentUser(userId) {
    this.currentUserId = userId;
  }

  // Generate authorization URL for OAuth flow
  async getAuthUrl(state = '') {
    const scopes = ['https://www.googleapis.com/auth/blogger'];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force consent to get refresh token
      include_granted_scopes: true,
      state
    });
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code, userId) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.refresh_token) {
        throw new Error('No refresh token received. Please revoke app access and try again.');
      }
      
      this.oauth2Client.setCredentials(tokens);
      
      // Get user info to validate
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      
      // Save tokens to database
      await OAuthToken.createOrUpdateToken(userId, {
        ...tokens,
        google_user_id: userInfo.data.id
      });
      
      console.log('✅ OAuth tokens exchanged and saved successfully');
      return tokens;
    } catch (error) {
      console.error('❌ Token exchange failed:', error);
      throw new Error(`Token exchange failed: ${error.message}`);
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(userId) {
    try {
      const tokenData = await OAuthToken.findActiveToken(userId);
      if (!tokenData) {
        throw new Error('No refresh token found. Please re-authorize.');
      }

      this.oauth2Client.setCredentials({
        refresh_token: tokenData.refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      // Update token in database
      await tokenData.updateAccessToken(credentials.access_token, credentials.expiry_date);

      console.log('✅ Access token refreshed successfully');
      return credentials;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      
      // If refresh fails, token might be revoked
      if (error.code === 400 || error.message.includes('invalid_grant')) {
        await OAuthToken.updateMany({ userId }, { isActive: false });
        throw new Error('Refresh token is invalid. Please re-authorize the application.');
      }
      
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  // Ensure we have a valid token for API calls
  async ensureValidToken(userId = null) {
    const targetUserId = userId || this.currentUserId;
    if (!targetUserId) {
      throw new Error('No user ID provided for token validation');
    }

    try {
      const tokenData = await OAuthToken.findActiveToken(targetUserId);
      if (!tokenData) {
        throw new Error('No OAuth token found. Please authorize the application first.');
      }

      // Check if token needs refresh
      if (tokenData.needsRefresh()) {
        console.log('🔄 Token needs refresh, refreshing...');
        await this.refreshAccessToken(targetUserId);
        
        // Get updated token
        const updatedToken = await OAuthToken.findActiveToken(targetUserId);
        this.oauth2Client.setCredentials({
          access_token: updatedToken.accessToken,
          refresh_token: updatedToken.refreshToken
        });
      } else {
        this.oauth2Client.setCredentials({
          access_token: tokenData.accessToken,
          refresh_token: tokenData.refreshToken
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      throw error;
    }
  }

  // Get user's blogs from Blogger API
  async getBlogs(userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      // Use 'self' instead of userId for current authenticated user
      const response = await this.blogger.blogs.listByUser({ 
        userId: 'self', // This is correct - always use 'self' for authenticated user
        fields: 'items(id,name,description,url,status,locale,posts,pages,published,updated,selfLink,customMetaData)'
      });
      
      const blogs = response.data.items || [];
      
      // Save/update blogs in database
      const savedBlogs = [];
      for (const blog of blogs) {
        const savedBlog = await Blog.createOrUpdateFromBloggerData(targetUserId, blog);
        savedBlogs.push(savedBlog.toSummary());
      }
      
      console.log(`✅ Fetched and synced ${savedBlogs.length} blogs`);
      return savedBlogs;
    } catch (error) {
      console.error('❌ Failed to fetch blogs:', error);
      
      // Enhanced error handling with specific messages
      if (error.code === 401) {
        throw new Error('Authentication failed. Please re-authorize the application.');
      } else if (error.code === 403) {
        throw new Error('Access denied. Please check your Blogger API permissions.');
      } else if (error.code === 404) {
        throw new Error('No blogs found for this user.');
      }
      
      throw new Error(`Failed to fetch blogs: ${error.message}`);
    }
  }

  // Get specific blog
  async getBlog(blogId, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      const response = await this.blogger.blogs.get({ 
        blogId,
        fields: 'id,name,description,url,status,locale,posts,pages,published,updated,selfLink,customMetaData'
      });
      
      const blog = response.data;
      const savedBlog = await Blog.createOrUpdateFromBloggerData(targetUserId, blog);
      
      return savedBlog.toSummary();
    } catch (error) {
      console.error('❌ Failed to fetch blog:', error);
      throw new Error(`Failed to fetch blog: ${error.message}`);
    }
  }

  // Get posts from a blog
  async getPosts(blogId, options = {}, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      const params = {
        blogId,
        maxResults: options.maxResults || 10,
        orderBy: options.orderBy || 'published',
        status: options.status || ['live', 'draft'],
        fields: 'items(id,title,content,labels,status,published,updated,url,selfLink,author,replies,customMetaData,location,images),nextPageToken',
        ...options
      };

      if (options.pageToken) {
        params.pageToken = options.pageToken;
      }

      if (options.startIndex) {
        params.startIndex = options.startIndex;
      }

      const response = await this.blogger.posts.list(params);
      const posts = response.data.items || [];
      
      // Cache posts in database
      for (const post of posts) {
        await Post.createOrUpdateFromBloggerData(targetUserId, blogId, post);
      }
      
      return {
        items: posts,
        nextPageToken: response.data.nextPageToken
      };
    } catch (error) {
      console.error('❌ Failed to fetch posts:', error);
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }
  }

  // Get specific post
  async getPost(blogId, postId, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      const response = await this.blogger.posts.get({ 
        blogId, 
        postId,
        fields: 'id,title,content,labels,status,published,updated,url,selfLink,author,replies,customMetaData,location,images'
      });
      
      const post = response.data;
      await Post.createOrUpdateFromBloggerData(targetUserId, blogId, post);
      
      return post;
    } catch (error) {
      console.error('❌ Failed to fetch post:', error);
      throw new Error(`Failed to fetch post: ${error.message}`);
    }
  }

  // Create new post
  async createPost(blogId, postData, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      const requestBody = {
        title: postData.title,
        content: postData.content,
        labels: postData.labels || []
      };

      const params = {
        blogId,
        requestBody,
        fields: 'id,title,content,labels,status,published,updated,url,selfLink,author'
      };

      if (postData.isDraft) {
        params.isDraft = true;
      }

      const response = await this.blogger.posts.insert(params);
      const newPost = response.data;
      
      // Cache the new post
      await Post.createOrUpdateFromBloggerData(targetUserId, blogId, newPost);
      
      console.log('✅ Post created successfully:', newPost.title);
      return newPost;
    } catch (error) {
      console.error('❌ Failed to create post:', error);
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }

  // Update existing post
  async updatePost(blogId, postId, postData, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      const requestBody = {
        title: postData.title,
        content: postData.content,
        labels: postData.labels || []
      };

      const response = await this.blogger.posts.update({
        blogId,
        postId,
        requestBody,
        fields: 'id,title,content,labels,status,published,updated,url,selfLink,author'
      });
      
      const updatedPost = response.data;
      
      // Update cache
      await Post.createOrUpdateFromBloggerData(targetUserId, blogId, updatedPost);
      
      console.log('✅ Post updated successfully:', updatedPost.title);
      return updatedPost;
    } catch (error) {
      console.error('❌ Failed to update post:', error);
      throw new Error(`Failed to update post: ${error.message}`);
    }
  }

  // Delete post
  async deletePost(blogId, postId, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      await this.blogger.posts.delete({ blogId, postId });
      
      // Remove from cache
      await Post.deleteOne({ postId, userId: targetUserId });
      
      console.log('✅ Post deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete post:', error);
      throw new Error(`Failed to delete post: ${error.message}`);
    }
  }

  // Get pages from blog
  async getPages(blogId, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      const response = await this.blogger.pages.list({ 
        blogId,
        fields: 'items(id,title,content,status,published,updated,url,selfLink,author)'
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch pages:', error);
      throw new Error(`Failed to fetch pages: ${error.message}`);
    }
  }

  // Get specific page
  async getPage(blogId, pageId, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      const response = await this.blogger.pages.get({ 
        blogId, 
        pageId,
        fields: 'id,title,content,status,published,updated,url,selfLink,author'
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch page:', error);
      throw new Error(`Failed to fetch page: ${error.message}`);
    }
  }

  // Create new page
  async createPage(blogId, pageData, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      const response = await this.blogger.pages.insert({
        blogId,
        requestBody: {
          title: pageData.title,
          content: pageData.content
        },
        fields: 'id,title,content,status,published,updated,url,selfLink,author'
      });
      
      console.log('✅ Page created successfully:', response.data.title);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create page:', error);
      throw new Error(`Failed to create page: ${error.message}`);
    }
  }

  // Update page
  async updatePage(blogId, pageId, pageData, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      const response = await this.blogger.pages.update({
        blogId,
        pageId,
        requestBody: {
          title: pageData.title,
          content: pageData.content
        },
        fields: 'id,title,content,status,published,updated,url,selfLink,author'
      });
      
      console.log('✅ Page updated successfully:', response.data.title);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update page:', error);
      throw new Error(`Failed to update page: ${error.message}`);
    }
  }

  // Delete page
  async deletePage(blogId, pageId, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      await this.blogger.pages.delete({ blogId, pageId });
      console.log('✅ Page deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete page:', error);
      throw new Error(`Failed to delete page: ${error.message}`);
    }
  }

  // Get comments from blog/post
  async getComments(blogId, postId = null, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      const params = { 
        blogId,
        fields: 'items(id,content,published,updated,author,status,post,inReplyTo)'
      };
      
      if (postId) {
        params.postId = postId;
      }
      
      const response = await this.blogger.comments.list(params);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch comments:', error);
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }
  }

  // Approve comment
  async updateCommentStatus(blogId, postId, commentId, status, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      let response;
      
      if (status === 'approved') {
        response = await this.blogger.comments.approve({
          blogId,
          postId,
          commentId
        });
      } else if (status === 'spam') {
        response = await this.blogger.comments.markAsSpam({
          blogId,
          postId,
          commentId
        });
      } else {
        throw new Error('Invalid comment status. Use "approved" or "spam".');
      }
      
      console.log('✅ Comment status updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update comment status:', error);
      throw new Error(`Failed to update comment status: ${error.message}`);
    }
  }

  // Delete comment
  async deleteComment(blogId, postId, commentId, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      await this.blogger.comments.delete({
        blogId,
        postId,
        commentId
      });
      
      console.log('✅ Comment deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete comment:', error);
      throw new Error(`Failed to delete comment: ${error.message}`);
    }
  }

  // Get post statistics (limited by Blogger API)
  async getPostStats(blogId, postId, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      const post = await this.getPost(blogId, postId, targetUserId);
      
      return {
        views: 0, // Blogger API doesn't provide view counts
        comments: post.replies?.totalItems || 0,
        published: post.published,
        updated: post.updated,
        status: post.status,
        labels: post.labels || []
      };
    } catch (error) {
      console.error('❌ Failed to fetch post stats:', error);
      throw new Error(`Failed to fetch post stats: ${error.message}`);
    }
  }

  // Search posts
  async searchPosts(blogId, query, userId = null) {
    const targetUserId = userId || this.currentUserId;
    await this.ensureValidToken(targetUserId);

    try {
      const response = await this.blogger.posts.search({
        blogId,
        q: query,
        fields: 'items(id,title,content,labels,status,published,updated,url,selfLink)'
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to search posts:', error);
      throw new Error(`Failed to search posts: ${error.message}`);
    }
  }
}

module.exports = new BloggerService();