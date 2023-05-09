const { redis } = require('./index')
exports.hotInc = async (videoId, incNum) => {
  const data = await redis.zscore('videohots', videoId)
  if (data) {
    return await redis.zincrby('videohots', incNum, videoId)
  } else {
    return await redis.zadd('videohots', incNum, videoId)
  }
}
exports.topHots = async (num) => {
  const rank = await redis.zrevrange('videohots', 0, -1, 'withscores')
  const newArr = rank.slice(0, num * 2)
  const obj = {}
  for (let i = 0; i < newArr.length; i++) {
    if (i % 2 === 0) {
      obj[newArr[i]] = newArr[i + 1]
    }
  }
  return obj
}