const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect Routes
exports.protect = async (req, res, next) => {
    let token;
    console.log('benis')

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){ //if they're sending the token directly (app)
        token = req.headers.authorization.split(' ')[1];
    } 
    else if(req.cookies.token){ //if they're using cookies (web)
        token = req.cookies.token
    }

    if(!token){
        res.status(401).json({success: false, error: 'Not Authorized'});
        return next(new ErrorResponse('Not Authorized', 401))
    }

    try {
        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findOne({ uuid: decoded.uuid });  //changed it to sign off on UUIDs so I could change these to break tokens

        if(!req.user){
            res.status(401).json({success: false, error: 'Not Authorized'});
            return next(new ErrorResponse('Not Authorized', 401)) //This is so when the user force logouts (changes their uuid), the return should no longer find them by uuid and this will return 401
        }
        
        //DO NOT USE NEXT FOR MIDDLEWARE LIKE YOU DO IN EXPRESS
        //next();

    } catch (error) {
        res.status(401).json({success: false, error: 'Not Authorized'});
        return next(new ErrorResponse('Not Authorized', 401))
    }


}

// Grant access to specific roles
exports.authorize = (...roles) => {
    return(req, res, next) => {
        if(!roles.includes(req.user.role)){
            res.status(403).json({success: false, error: `User role ${req.user.role} is not authorized to access this route`});
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403))
        }
        //next();
    }
}