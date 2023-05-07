const { User, Subscribe } = require('../model/index')
const { createToken } = require('../util/jwt')
const fs = require('fs')
const { promisify } = require('util')
const lodash = require('lodash')
const rename = promisify(fs.rename)
exports.getchannel = async (req, res) => {
  let channelList = await Subscribe.find({
    channel: req.user.userInfo._id
  }).populate('channel')
  channelList = channelList.map((item) => {
    return lodash.pick(item.user, [
      '_id',
      'username',
      'image',
      'subscribeCount',
      'cover',
      'channeldes'
    ])
  })
  res.status(200).json(channelList)
}
exports.getsubscribe = async (req, res) => {
  let subscribeList = await Subscribe.find({
    user: req.params.userId
  }).populate('channel')
  subscribeList = subscribeList.map((item) => {
    return lodash.pick(item.channel, [
      '_id',
      'username',
      'image',
      'subscribeCount',
      'cover',
      'channeldes'
    ])
  })
  res.status(200).json(subscribeList)
}
exports.getuser = async (req, res) => {
  let isSubscribe = false
  if (req.user) {
    const record = await Subscribe.findOne({
      channel: req.params.userId,
      user: req.user.userInfo._id
    })
    if (record) {
      isSubscribe = true
    }
  }
  const user = await User.findById(req.params.userId)
  user.isSubscribe = isSubscribe
  res.status(200).json({
    ...lodash.pick(user, [
      '_id',
      'username',
      'image',
      'subscribeCount',
      'cover',
      'channeldes'
    ]),
    isSubscribe
  })
}
exports.unsubscribe = async (req, res) => {
  const userId = req.user.userInfo._id
  const channelId = req.params.userId
  if (userId === channelId) {
    return res.status(401).json({ err: '不能取消关注自己' })
  }
  const record = await Subscribe.findOne({ 
    user: userId,
    channel: channelId
  })
  if (record) {
    await record.remove()
    const user = await User.findById(channelId)
    user.subscribeCount --
    await user.save()
    res.status(200).json(user)
  } else {
    res.status(401).json({ err: '你已经取消订阅了此频道' })
  }
}
exports.subscribe = async (req, res) => {
  const userId = req.user.userInfo._id
  const channelId = req.params.userId
  if (userId === channelId) {
    return res.status(401).json({ err: '不能关注自己' })
  }
  const record = await Subscribe.findOne({ 
    user: userId,
    channel: channelId
  })
  if (!record) {
    await new Subscribe({
      user: userId,
      channel: channelId
    }).save()
    const user = await User.findById(channelId)
    user.subscribeCount ++
    await user.save()
    res.status(200).json({ msg: '关注成功' })
  } else {
    res.status(401).json({ err: '你已经订阅了此频道' })
  }
}
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
exports.update = async (req, res) => {
  const id = req.user.userInfo._id
  const dbBack = await User.findOneAndUpdate(id, req.body, { new: true })
  res.status(202).json({ user: dbBack })
}
exports.headimg = async (req, res) => {
  const fileArr = req.file.originalname.split('.')
  const fileType = fileArr[fileArr.length - 1]
  try {
    await rename('./public/' + req.file.filename, './public/' + req.file.filename + '.' +fileType)
    res.status(201).json({ filepath: req.file.filename + '.' +fileType })
  } catch (error) {
    res.status(500).json({error})
  }
}
exports.list = async (req, res) => {
  res.send('/user-list')
}
exports.delete = async (req, res) => {
  
}