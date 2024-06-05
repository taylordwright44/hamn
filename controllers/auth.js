const path = require('path');
const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
// const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const { v4: uuidv4 } = require('uuid');

// Get Token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, keep) => {
    const token = user.getSignedJwt(keep);

    const options = {
        expires: keep ? new Date('9999-12-31T23:59:59Z') : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), //when I left this as null it was saying session, which I'm not sure if that is fine or not?
        httpOnly: true, //Http Only cookies helps prevent XSS, don't use localStorage
    }

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
        success: true,
        token // This is where the app will offically break off from the site. App will have to use this with Capacitor plugin since cookies don't exist. 
        //Still can't use localStorage due to it getting cleared in phone sweeps to save room :/
    });

}

//Register user
//route POST /api/v1/auth/register
//access Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, username, keep, phone } = req.body

    let userCheck = await User.findOne({phone: phone, verified: true})

    if(userCheck){
        return next( new ErrorResponse('This number is already verified to another account.', 400));
    };

    //Create User
    const user = await User.create({
        name, 
        username,
        email,
        password,
        phone,
        role: 'user',
        uuid: uuidv4(), //I'll use this for the signatures from now on
    });

    sendTokenResponse(user, 200, res, keep);
});

//Login user
//route POST /api/v1/auth/login
//access Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password, keep } = req.body

    if(!email || !password ){
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    let user;

    if (email.includes('@')) {
        //check user
        user = await User.findOne({ email }).select('+password'); //Since password was purposely not included in the model to be returned, yet needs to be included here
    } else {
        user = await User.findOne({ username: email }).select('+password');
    }

    if(!user){
        return next(new ErrorResponse('Invalid Credentials', 400)); //don't say user not found so people don't use this route to check emails
    }

    //Check if password matches
    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        return next(new ErrorResponse('Invalid Credentials', 400)) //I do 400 here so I can use 401 on the frontend. So anytime someone gets a 401, I clear their JWT, set logout to false, and redirect them to the Login page
    }

    sendTokenResponse(user, 200, res, keep);
});

//Get current logged in user
// GET /api/v1/auth/me
//Private
exports.getMe = asyncHandler(async(req, res, next) =>{
    const user = await User.findById(req.user.id);
    console.log('test')

    res.status(200).json({
        success: true,
        data: { _id: user._id, name: user.name, email: user.email, username: user.username, role: user.role, photo: user.photo, blocked: user.blocked, following: user.following, bio: user.bio, twitch: user.twitch, verified: user.verified, banned: user.isBanned}
    })
})
