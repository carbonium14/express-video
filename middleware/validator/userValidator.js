const { body } = require('express-validator')
const validate = require('./errorBack')
const { User } = require('../../model/index')
module.exports.register = validate([
  body('username').notEmpty().withMessage('用户名不能为空').bail().isLength({ min: 3 }).withMessage('用户名长度不能小于3').bail(),
  body('email').notEmpty().withMessage('邮箱不能为空').bail().isEmail().withMessage('请输入正确的邮箱格式').bail().custom(async (val) => {
    const emailValidate = await User.findOne({ email: val })
    if (emailValidate) {
      return Promise.reject('邮箱已被注册')
    }
  }).bail(),
  body('phone').notEmpty().withMessage('手机号不能为空').bail().custom(async (val) => {
    if (!/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(val)) {
      return Promise.reject('请输入正确的手机号')
    }
  }).bail().custom(async (val) => {
    const phoneValidate = await User.findOne({ phone: val })
    if (phoneValidate) {
      return Promise.reject('手机号已被注册')
    }
  }).bail(),
  body('password').notEmpty().withMessage('密码不能为空').bail().isLength({ min: 5 }).withMessage('密码长度不能小于5').bail(),
])
module.exports.login = validate([
  body('email').notEmpty().withMessage('邮箱不能为空').bail().isEmail().withMessage('请输入正确的邮箱格式').bail().custom(async (val) => {
    const emailValidate = await User.findOne({ email: val })
    if (!emailValidate) {
      return Promise.reject('此邮箱未被注册, 请先注册再使用')
    }
  }).bail(),
  body('password').notEmpty().withMessage('密码不能为空').bail().isLength({ min: 5 }).withMessage('密码长度不能小于5').bail(),
])