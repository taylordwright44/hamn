const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//There's a lot of unused junk in here, that's because I copy pasted my model from my express app and just left it in.
//I'll probably add most of it back later.
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        maxlength: [60, 'Name can not be longer than 60 characters']
    },
    bio: {
        type: String,
        maxlength: [300, 'Bio can not be longer than 300 characters']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'], //this will be phased out for phones
      unique: true, //no two same emails for this particular app since it'll be used for logins/no usernames,
      maxlength: [100, 'Email can not be longer than 100 characters'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
        type: String,
        required: [true, 'Please add a number.'],
        maxlength: 14,
        match: [
            /^\+?[1-9]\d{1,14}$/,
            'Please use a valid number.'
        ]
    },
    verified: { //so I'll write a function in certain routes (comment, post event, stream) that checks if they've verified they're number or not and ARE NOT banned. I'll also change account creation to check for the number AND verified: true. Lastly I'll make sure the verified route checks if any other phone numbers are verified. This will make sure only one number can be verified, only verified numbers can post, and if someone gets banned they can still use the app but not be disruptive anymore.
        type: Boolean
    },
    safe: {
        type: Boolean,
        default: false,
    },
    smsTime: {
        createdAt: {
            type: Date,
        }
    },
    verificationCode: {
        type: String,
    },
    verificationCodeExpiresAt: {
        type: Date,
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    bannedDate: {
        type: Date,
        default: null,
    },
    banReason: {
        type: String,
        default: '',
    },
    username: {
        type: String,
        required: [true, 'Please create a Username'], 
        unique: true, 
        maxlength: [20, 'Username can not be longer than 20 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'A-Z, 0-9, and underscores only for username.'],
        lowercase: true        
      },
    role: {
        type: String,
        enum: ['user', 'mod', 'admin'], //I am aware I could use numbers here, but words are easier to remember than ranks when writing if statements
        default: 'user'
    },
    photo: {
        type: String,
        default: 'Assets/no-avatar.jpg'
    },
    uuid: {
        type: String
    },
    following: [
        {
            user: String, _id: false
        }
    ],
    blocked: [
        {
            user: String, _id: false
        }
    ],
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        maxlength: [300, 'Password can not be longer than 300 characters'],
        select: false //Select false makes sure it doesn't get returned to user
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    reportPrivilege: {
        type: Boolean,
        default: true,
    },
    reports: [
        {
            user: {
                type: String
            },
            reason: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using Bcrpyt
UserSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwt = function(keep){ //Brad's method was called getSignedJwtToken but that's redundant since jwt stands for JSON web token.
    return jwt.sign({ id: this._id, uuid: this.uuid}, process.env.JWT_SECRET, { //using UUID since it's changeable, ID isn't. That way I can force logouts.
        expiresIn: keep ? 9999999999 : process.env.JWT_EXPIRE 
    }) 
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
    //Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    //Hash Token and set to resetPasswordTokenField
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    //Set Expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

module.exports = mongoose.model('User', UserSchema);