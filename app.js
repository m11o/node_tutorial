const http = require('http')
const morgan = require('morgan')
const express = require('express')
const path = require('path')
const bodyparser = require('body-parser')
const mongoose = require('mongoose')

const Message = require('./schema/Message')

const app = express()

mongoose.connect('mongodb://127.0.0.1:27017/chatapp', err => {
  if (err) {
    console.error(err)
  } else {
    console.log('Successfully connected to MongoDB.')
  }
})

app.use(morgan('combined'))
app.use(bodyparser.urlencoded({ extended: true }))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get('/', (req, res, next) => {
  Message.find({}, (err, msgs) => {
    if (err) throw err
    return res.render('index', { messages: msgs })
  })
})

app.get('/update', (req, res, next) => {
  return res.render('update')
})

app.post('/update', (req, res, next) => {
  const newMessage = new Message({
    username: req.body.username,
    message: req.body.message
  })
  newMessage.save(err => {
    if (err) throw err
    return res.redirect('/')
  })
})

const server = http.createServer(app)
server.listen(3000)
