const mongoose = require('mongoose')
const validator = require('validator')
const crypto = require('crypto')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name should have more than 4 characters"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please enter your valid email"]
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [6, "Name should have more than 4 characters"],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    },
    role: {
        type: String,
        default: "user"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})

// generate password reset token 
userSchema.methods = {
    passwordResettoken: function () {

        const resetToken = crypto.randomBytes(20).toString('hex')

        this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.resetPasswordExpire = Date.now() + 15 * 60 * 1000

        return resetToken;
    }
}

module.exports = mongoose.model('User', userSchema)