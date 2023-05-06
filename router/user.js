const express = require('express')
const userController = require('../controller/userController')
const validator = require('../middleware/validator/userValidator')
const { verifyToken } = require('../util/jwt')
const router = express.Router()
router
.post('/registers', validator.register, userController.register)
.post('/logins', validator.login, userController.login)
.get('/lists', verifyToken ,userController.list)
.delete('/', userController.delete)
module.exports = router