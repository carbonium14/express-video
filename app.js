const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const router = require('./router/index')
const app = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())
app.use(morgan('dev'))
app.use('/api/v1', router)
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})