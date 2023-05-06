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
  User: mongoose.model('User', require('./userModel'))
}