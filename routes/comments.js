const HyperExpress = require('hyper-express');
const { 
    getComments, 
    getComment, 
    addComment, 
    updateComment, 
    deleteComment
 } = require('../controllers/comments');

 const Comment = require('../models/Comment');

 const router = new HyperExpress.Router();

const advancedResults = require('../middleware/advancedResults');
//add protect ability; can now protect any route that needs to be logged in
const { protect, authorize } = require('../middleware/auth'); 

router.route('/')
.get(advancedResults(Comment, {
    path: 'post',
    select: 'name description'
}), getComments)
.post(protect, addComment);

router.route('/:id')
.get(getComment)
.put(protect, updateComment)
.delete(protect, deleteComment);

module.exports = router;