const express = require('express')
const videoController = require('../controller/videoController')
const router = express.Router()
router.get('/lists', videoController.list)
module.exports = router