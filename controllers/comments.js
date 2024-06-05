const Post = require('../models/Post');
const asyncHandler  = require('../middleware/async');

exports.getComments = asyncHandler(async (req, res) => {
    const comments = await Comment.find({post: req.params.postId}).populate({
        path: 'user',
        select: 'name photo username'
    });

    return res.status(200).json({
        success: true,
        count: comments.length,
        data: comments
    })
});

exports.getComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id).populate({
        path: 'event',
        select: 'name description'
    }).populate({ //sweet, so we can double populate. 
        path: 'user',
        select: 'name photo username'
    })

    if(!comment){
        return res.status(404).json({ success: false, error: 'Comment not found' });
    };

    res.status(200).json({
        success: true,
        data: comment
    })
});

exports.addComment = asyncHandler(async (req, res, next) => {
    req.body.event = req.params.eventId;
    req.body.user = req.user.id;

    const post = await Post.findById(req.params.eventId);

    if(!post){
        return next(new ErrorResponse(`No post with the id of ${req.params.eventId}`, 404));
    };

    const comment = await Comment.create(req.body);

    res.status(200).json({
        success: true,
        data: comment
    })
});

exports.updateComment = asyncHandler(async (req, res, next) => {
    let comment = await Comment.findById(req.params.id);

    if(!comment){
        return next(new ErrorResponse(`No comment with the id of ${req.params.id}`, 404));
    };

    if(comment.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next( new ErrorResponse(`User not authorized to update comment ${comment.id}`, 403));
    }

    comment = await Comment.findByIdAndUpdate(req.params.id, {comment: req.body.comment, safe: false}, { //changed this for only comment so they don't start editing shit like the reports or if it's a safe comment.
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: comment
    })
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    console.log(comment)

    if(!comment){
        return next(new ErrorResponse(`No comment with the id of ${req.params.id}`, 404));
    };

    const post = await Event.findById(comment.event); //So we can allow the event owner to delete people's comments on the event.

    if(comment.user.toString() !== req.user.id && req.user.role !== 'admin' && post.user.toString() !== req.user.id){
        return next( new ErrorResponse(`User not authorized to delete comment ${comment.id}`, 403));
    }

    await comment.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    })
});