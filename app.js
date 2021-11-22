const http = require('http')
const morgan = require('morgan')
const express = require('express')
const path = require('path')
const bodyparser = require('body-parser')
const mongoose = require('mongoose')
const fileupload = require('express-fileupload')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const helmet = require('helmet')
const csrf = require('csurf')
const csrfProtection = csrf()

const RootController = require('./controllers/RootController')
const MessagesController = require('./controllers/MessagesController')
const SessionsController = require('./controllers/SessionsController')
const RegistrationsController = require('./controllers/RegistrationsController')

const passportConfig = require('./config/passport')
const logger = require('./lib/logger')

const app = express()

mongoose.connect('mongodb://127.0.0.1:27017/chatapp', err => {
  if (err) {
    console.error(err)
  } else {
    console.log('Successfully connected to MongoDB.')
  }
})

app.use(morgan('combined'))
app.use(helmet())
app.use(bodyparser.urlencoded({ extended: true }))

app.use(session({
  secret: 'hoge',
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({
    client: mongoose.connection.client,
    mongooseConnection: mongoose.connection,
    db: 'session',
    ttl: 14 * 24 * 60 * 60
  })
}))
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

app.get('/', RootController.index)

passportConfig(passport)
app.get('/signup', RegistrationsController.new)
app.post('/signup', fileupload(), RegistrationsController.create)

app.get('/login', SessionsController.new)
app.post('/login', passport.authenticate('local'), SessionsController.create)
app.delete('/logout', SessionsController.destroy)

app.get('/messages/new', csrfProtection, MessagesController.index)
app.post('/messages', fileupload(), csrfProtection, MessagesController.create)

// Error handling
app.use((_req, res, _next) => {
  const err = new Error('Not Found')

  err.status = 404
  return res.render('common/error', { status: err.status })
})

app.use((err, _req, res, _next) => {
  logger.error(err)
  if (err.code == 'EBADCSRFTOKEN') {
    res.status(403)
  } else {
    res.status(err.status || 500)
  }

  return res.render('common/error', {
    status: err.status || 500,
    message: err.message
  })
})

const server = http.createServer(app)
server.listen(3000)
