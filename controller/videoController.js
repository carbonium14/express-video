const { Video, Videocomment, Videolike, Subscribe, Collect } = require('../model/index')
const { hotInc, topHots } = require('../model/redis/redishotsinc')
exports.gethots = async (req, res) => {
  const topnum = req.params.topnum
  const tops = await topHots(topnum)
  res.status(200).json({tops})
}
exports.collect = async (req, res) => {
  const { videoId } = req.params
  const userId = req.user.userInfo._id
  const video = await Video.findById(videoId)
  if (!video) {
    return res.status(404).json({ err: '视频不存在' })
  }
  const doc  = await Collect.findOne({
    user: userId,
    video: videoId
  })
  if (doc) {
    return res.status(403).json({ err: '你已经收藏过了' })
  }
  const myCollect = await Collect({
    user: userId,
    video: videoId
  }).save()
  if (myCollect) {
    await hotInc(videoId, 3)
  }
  res.status(201).json({myCollect})
}
exports.likelist = async (req, res) => {
  const { pageNum = 1, pageSize = 10 } = req.body
  const likes = await Videolike.find({
    like: 1,
    user: req.user.userInfo._id
  }).skip((pageNum - 1) * pageSize).limit(pageSize).populate('video', '_id title vodvideoId user')
  const likeCount = await Videolike.countDocuments({
    like: 1,
    user: req.user.userInfo._id
  })
  res.status(200).json({ likes, likeCount })
}
exports.dislikevideo = async (req, res) => {
  const { videoId } = req.params
  const userId = req.user.userInfo._id
  const video = await Video.findById(videoId)
  if (!video) {
    res.status(404).json({ err: '视频不存在' })
  }
  const doc = await Videolike.findOne({
    user: userId,
    video: videoId
  })
  let isDislike = true
  if (doc && doc.like === -1) {
    await doc.remove()
  } else if (doc && doc.like === 1) {
    doc.like = -1
    await doc.save()
    isDislike = false
  } else {
    await new Videolike({
      user: userId,
      video: videoId,
      like: -1
    }).save()
  }
  video.likeCount = await Videolike.countDocuments({
    video: videoId,
    like: 1
  })
  video.dislikeCount =await Videolike.countDocuments({
    video: videoId,
    like: -1
  })
  await video.save()
  res.status(200).json({
    ...video.toJSON(),
    isDislike
  })
}
exports.likevideo = async (req, res) => {
  const { videoId } = req.params
  const userId = req.user.userInfo._id
  const video = await Video.findById(videoId)
  if (!video) {
    res.status(404).json({ err: '视频不存在' })
  }
  const doc = await Videolike.findOne({
    user: userId,
    video: videoId
  })
  let isLike = true
  if (doc && doc.like === 1) {
    await doc.remove()
    isLike = false
  } else if (doc && doc.like === -1) {
    doc.like = 1
    await doc.save()
    await hotInc(videoId, 2)
  } else {
    await new Videolike({
      user: userId,
      video: videoId,
      like: 1
    }).save()
    await hotInc(videoId, 2)
  }
  video.likeCount = await Videolike.countDocuments({
    video: videoId,
    like: 1
  })
  video.dislikeCount =await Videolike.countDocuments({
    video: videoId,
    like: -1
  })
  await video.save()
  res.status(200).json({
    ...video.toJSON(),
    isLike
  })
}
exports.deletecomment = async (req, res) => {
  const { videoId, commentId } = req.params
  const videoInfo = await Video.findById(videoId)
  if (!videoInfo) {
    res.status(404).json({ err: '视频不存在' })
  }
  const comment = await Videocomment.findById(commentId)
  if (!comment) {
    res.status(404).json({ err: '评论不存在' })
  }
  if (!comment.user.equals(req.user.userInfo._id)) {
    res.status(403).json({ err: '不能删除别人的评论' })
  }
  await comment.remove()
  videoInfo.commentCount --
  await videoInfo.save()
  res.status(200).json({ msg: '删除成功' })
}
exports.commentlist = async (req, res) => {
  const { videoId } = req.params
  const { pageNum = 1, pageSize = 10 } = req.body
  const comments = await Videocomment.find({ video: videoId }).skip((pageNum - 1) * pageSize).limit(pageSize).populate('user', '_id username imgage')
  const commentCount = await Videocomment.countDocuments({ video: videoId })
  res.status(200).json({ comments, commentCount })
}
exports.comment = async (req, res) => {
  const { videoId } = req.params
  const videoInfo = await Video.findById(videoId)
  if (!videoInfo) {
    return res.status(404).json({ err : '视频不存在' })
  }
  const comment = await new Videocomment({
    content: req.body.content,
    video: videoId,
    user: req.user.userInfo._id
  }).save()
  await hotInc(videoId, 2)
  videoInfo.commentCount ++
  await videoInfo.save()
  res.status(201).json(comment)
}
exports.videolist = async (req, res) => {
  let { pageNum = 1, pageSize = 10 } = req.body
  const videoList = await Video.find().skip((pageNum - 1) * pageSize).limit(pageSize).sort({ createAt: -1 }).populate('user', '_id username cover')
  const getvideoCount = await Video.countDocuments()
  res.status(200).json({ videoList, getvideoCount })
}
exports.video = async (req, res) => {
  const { videoId } = req.params
  let videoInfo = await Video.findById(videoId).populate('user', '_id username cover')
  videoInfo = videoInfo.toJSON()
  videoInfo.isLike = false
  videoInfo.isDislike = false
  videoInfo.isSubscribe = false
  if (req.user.userInfo) {
    const userId = req.user.userInfo._id
    if(await Videolike.findOne({ user: userId, video: videoId, like: 1 })) {
      videoInfo.isLike = true
    }
    if(await Videolike.findOne({ user: userId, video: videoId, like: -1 })) {
      videoInfo.isDislike = true
    }
    if(await Subscribe.findOne({ user: userId, channel: videoInfo.user._id })) {
      videoInfo.isSubscribe = true
    }
  }
  await hotInc(videoId, 1)
  res.status(200).json({ videoInfo })
}
exports.createvideo = async (req, res) => {
  const body = req.body
  body.user = req.user.userInfo._id
  const videoModel = new Video(body)
  try {
    const dbBack = await videoModel.save()
    res.status(201).json({dbBack})
  } catch (error) {
    res.status(500).json({error})
  }
}