const { User } = require('../model/index')
const { createToken } = require('../util/jwt')
exports.register = async (req, res) => {
  const userModel = new User(req.body)
  const dbBack = await userModel.save()
  const user = dbBack.toJSON()
  delete user.password
  res.status(201).json({user})
}
exports.login = async (req, res) => {
  let dbBack = await User.findOne(req.body)
  if (!dbBack) {
    res.status(402).json({ error: '邮箱或者密码不正确' })
  }
  dbBack = dbBack.toJSON()
  dbBack.token = await createToken(dbBack)
  res.status(200).json(dbBack)
}
exports.list = async (req, res) => {
  res.send('/user-list')
}
exports.delete = async (req, res) => {
  
}