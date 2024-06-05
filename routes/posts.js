const HyperExpress = require('hyper-express');
const {
    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost
} = require('../controllers/posts');

const Post = require('../models/Post');

//Include other resource routers
const commentRouter = require('./comments');

const router = new HyperExpress.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

//THIS IS THE LINE I AM CURRENTLY STRUGGLING WITH
//router.use('/:postId/comments', commentRouter); //pretty much just forwarding anything going to /event/:id/comments to the comments route

router.route('/')
    .get(advancedResults(Post), getPosts)
router.post('/', protect, createPost);
//this example would only let admin or mods create post.
//router.post('/', protect, authorize('admin', 'mod'), createPost);
router.get('/:id', getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;