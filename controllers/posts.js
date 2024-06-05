const Post = require('../models/Post');
const asyncHandler  = require('../middleware/async');

exports.createPost = asyncHandler(async (req, res) => {
    const { head, body } = req.body;

    let query = {
        head,
        body,
        user: req.user._id
    }

    const post = await Post.create(query);
    res.status(200).json({success: true, data: post});
});

exports.getPosts = asyncHandler(async (req, res) => {

    //advanced search results. See Traversy's nodejs api masterclass on Udemy if you want to understand how this works.
    res.status(200).json(res.advancedResults);
});

exports.getPost = asyncHandler(async (req, res) => {
    console.log('test')
    const post = await Post.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } }, // Increment view count by 1.
        { new: true } // Return the updated document
    ).populate({ //populate is how you reference another model. This returns the user who created the post's info with the post.
        path: 'user',
        select: 'name photo username'
    });

    if(!post){
        return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.status(200).json({success: true, post: post}); 
});

exports.updatePost = asyncHandler(async (req, res) => {
    let post = await Post.findById(req.params.id);

    if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
    }

    //Make sure user is event owner
    if(post.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return res.status(403).json({ success: false, error: 'User is not authorized to update this post.' });
    }

    let query = { 
        head: req.body.head, 
        body: req.body.body,
        updated:  Date.now()
    }
    
    post = await Post.findByIdAndUpdate(
        req.params.id,
        query,
        { 
            new: true, 
            runValidators: true 
        }
    );
    
    res.status(200).json({success: true, data: post});
});

exports.deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
  
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    //Make sure user is event owner
    if(post.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return res.status(403).json({ success: false, error: 'User is not authorized to delete this post.' });
    }

    await post.deleteOne();
  
    res.status(200).json({ success: true, data: {} });
});