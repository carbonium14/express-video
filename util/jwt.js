const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const { uuid } = require('../config/config.default')
const tojwt = promisify(jwt.sign)
const verify = promisify(jwt.verify)
module.exports.verifyToken = (required = true) => {
  return async (req, res, next) => {
    let token = req.headers.authorization
    token = token ? token.split("Bearer ")[1] : null
    if (token) {
      try {
        let userInfo = await verify(token, uuid)
        req.user = userInfo
        next()
      } catch (error) {
        res.status(402).json({ error: '无效的token' })
      }
    } else if (required) {
      res.status(402).json({ error: '请传入token' })
    } else {
      next()
    }
  }
}
module.exports.createToken = async (userInfo) => {
  return await tojwt({ userInfo }, uuid, {
    expiresIn: 60*60*24
  })
}
