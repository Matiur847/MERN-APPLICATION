const jwt = require('jsonwebtoken')
const { jwtSec } = require('../config/config')
const User = require('../models/userModel')

exports.isAuthenticatedUser = async (req, res, next) => {
    try {
        const { token } = req.cookies
        if (!token) {
            return res.send({
                success: false,
                message: "Please login to access the resource"
            })
        }

        next()

    } catch (error) {
        console.log(error.message)
        return res.send(error.message)
    }
}

exports.authorizeRoles = (...roles) => {
    return async (req, res, next) => {
        const { token } = req.cookies
        const decodeData = jwt.verify(token, jwtSec)
        const currentUser = await User.findById(decodeData.id)

        if (!roles.includes(currentUser.role)) {
            return next(
                res.status(403).json(
                    `Role: ${currentUser.role} is not allowed to access this resource, only ADMIN can access the resource`
                )
            )
        }

        next()
    }
}

