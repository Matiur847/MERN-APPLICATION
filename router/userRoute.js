const express = require('express')
const { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, getUserDetails, updateUserPassword, userProfileUpdate, getAllUser, getSingleUser, updateUserRole, deleteUser } = require('../controllers/userController')
const router = express.Router()
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/forgot/password', forgotPassword)
router.put('/forgot/password/:token', resetPassword)
router.get('/logout', logoutUser)
router.get('/user/details', getUserDetails)
router.put('/update/password', updateUserPassword)
router.put('/update/profile', userProfileUpdate)
router.get('/admin/users', isAuthenticatedUser, authorizeRoles("admin"), getAllUser)
router.get('/admin/user/:id', authorizeRoles("admin"), getSingleUser)
router.put('/admin/update/user/role/:id', authorizeRoles("admin"), updateUserRole)
router.delete('/admin/user/delete/:id', authorizeRoles("admin"), deleteUser)

module.exports = router;