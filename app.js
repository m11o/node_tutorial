const http = require('http')
const morgan = require('morgan')
const express = require('express')
const path = require('path')
const bodyparser = require('body-parser')
const mongoose = require('mongoose')
const fileupload = require('express-fileupload')
const passport = require('passport')
const session = require('express-session')

const User = require('./schema/User')
const Message = require('./schema/Message')

const MessagesController = require('./controllers/MessagesController')
const SessionsController = require('./controllers/SessionsController')
const RegistrationsController = require('./controllers/RegistrationsController')

const passportConfig = require('./config/passport')

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

app.use(session({ secret: 'hoge', resave: true, saveUninitialized: false }))  // need to use environment variables
app.use(passport.initialize())
app.use(passport.session())

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use('/image', express.static(path.join(__dirname, 'image')))
app.use('/avatar', express.static(path.join(__dirname, 'avatar')))

app.use((req, res, next) => {
  if (req.isAuthenticated()) return next()

  switch (req.url) {
    case '/login':
    case '/signup':
      next()
      break
    default:
      res.redirect('/login')
  }
})

app.get('/', (req, res, _next) => {
  Message.find({ user: req.session.passport.user }, (err, msgs) => {
    if (err) throw err
    return res.render('index', {
      messages: msgs,
      user: req.session && req.session.user ? req.session.user : null
    })
  })
})

passportConfig(passport)
app.get('/signup', RegistrationsController.new)
app.post('/signup', fileupload(), RegistrationsController.create)

app.get('/login', SessionsController.new)
app.post('/login', passport.authenticate('local'), SessionsController.create)

app.get('/messages/new', MessagesController.index)
app.post('/messages', fileupload(), MessagesController.create)

const server = http.createServer(app)
server.listen(3000)
