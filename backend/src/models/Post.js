const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
    unique: true
  },
  blogId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  labels: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['LIVE', 'DRAFT', 'SCHEDULED'],
    default: 'DRAFT'
  },
  published: {
    type: Date
  },
  updated: {
    type: Date,
    default: Date.now
  },
  url: String,
  selfLink: String,
  author: {
    id: String,
    displayName: String,
    url: String,
    image: {
      url: String
    }
  },
  replies: {
    totalItems: {
      type: Number,
      default: 0
    },
    selfLink: String
  },
  customMetaData: String,
  location: {
    name: String,
    lat: Number,
    lng: Number,
    span: String
  },
  images: [{
    url: String
  }],
  lastSynced: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
postSchema.index({ userId: 1, blogId: 1 });
postSchema.index({ postId: 1 });
postSchema.index({ status: 1 });
postSchema.index({ published: -1 });
postSchema.index({ updated: -1 });
postSchema.index({ labels: 1 });

// Static method to create or update from Blogger API data
postSchema.statics.createOrUpdateFromBloggerData = async function(userId, blogId, bloggerData) {
  const existingPost = await this.findOne({ 
    postId: bloggerData.id,
    userId: userId 
  });
  
  const postData = {
    postId: bloggerData.id,
    blogId: blogId,
    userId: userId,
    title: bloggerData.title,
    content: bloggerData.content,
    labels: bloggerData.labels || [],
    status: bloggerData.status,
    published: bloggerData.published ? new Date(bloggerData.published) : null,
    updated: new Date(bloggerData.updated),
    url: bloggerData.url,
    selfLink: bloggerData.selfLink,
    author: bloggerData.author,
    replies: bloggerData.replies,
    customMetaData: bloggerData.customMetaData,
    location: bloggerData.location,
    images: bloggerData.images,
    lastSynced: new Date()
  };
  
  if (existingPost) {
    Object.assign(existingPost, postData);
    await existingPost.save();
    return existingPost;
  } else {
    const newPost = new this(postData);
    await newPost.save();
    return newPost;
  }
};

// Static method to find posts by user and blog
postSchema.statics.findByUserAndBlog = function(userId, blogId, options = {}) {
  const query = { userId, blogId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.search) {
    query.$or = [
      { title: { $regex: options.search, $options: 'i' } },
      { content: { $regex: options.search, $options: 'i' } }
    ];
  }
  
  let queryBuilder = this.find(query);
  
  if (options.sort) {
    queryBuilder = queryBuilder.sort(options.sort);
  } else {
    queryBuilder = queryBuilder.sort({ published: -1, updated: -1 });
  }
  
  if (options.limit) {
    queryBuilder = queryBuilder.limit(options.limit);
  }
  
  if (options.skip) {
    queryBuilder = queryBuilder.skip(options.skip);
  }
  
  return queryBuilder;
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;