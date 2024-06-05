//I'm breaking off from Traversy's express tutorial and making the errorHandler, asyncHandler, and JSON body parser all one file here.
const ErrorResponse = require('../utils/errorResponse');

const asyncHandler = fn => async (req, res, next) => {
    console.log('donut')
    try {
        req.body = await req.json(); //this will allow us to parse JSON requests as req.body, just like express.
        await fn(req, res, next);
    } catch (err) {
        let error = { ...err };
        error.message = err.message;

        // Log to console for dev
        console.log(err.stack.red);

        // Mongoose bad ObjectId
        if (err.name === 'CastError') {
            const message = `Resource not found`;
            error = new ErrorResponse(message, 404);
        }

        // Mongoose duplicate key
        if (err.code === 11000) {
            const message = `Duplicate field value entered`;
            error = new ErrorResponse(message, 400);
        }

        // Mongoose validation error
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => ' ' + val.message);
            error = new ErrorResponse(message.toString().slice(1), 400);
        }

        res.status = res.status || res.writeStatus;  // Use writeStatus if status is not defined
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || 'Server Error',
        });
    }
};

module.exports = asyncHandler;