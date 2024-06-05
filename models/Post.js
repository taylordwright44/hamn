const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    head: {
        type: String,
        required: [true, 'Please add a head'],
        trim: true,
        maxlength: [50, 'Head can not be more than 50 characters']
      },
      body: {
        type: String,
        required: [true, 'Please add a body'],
        maxlength: [2500, 'Body can not be more than 2500 characters']
      }, 
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      views:{
        type: Number,
        default: 0
      },      
      createdAt: {
        type: Date,
        default: Date.now(),
      },
      updated: {
        type: Date
      }
});

module.exports = mongoose.model('Post', PostSchema);