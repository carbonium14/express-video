const mongoose = require('mongoose')
const { mongopath } = require('../config/config.default')
async function main () {
  await mongoose.connect(mongopath)
}
main().then(() => {
  console.log('success')
}).catch((err) => {
  console.log(err)
})
module.exports = {
  User: mongoose.model('User', require('./userModel')),
  Video: mongoose.model('Video', require('./videoModel')),
  Subscribe: mongoose.model('Subscribe', require('./subscribeModel')),
  Videocomment: mongoose.model('Videocomment', require('./videocommentModel')),
  Videolike: mongoose.model('Videolike', require('./videolikeModel')),
  Collect: mongoose.model('Collect', require('./collectModel')),
}