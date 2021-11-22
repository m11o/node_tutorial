const http = require('http')
const morgan = require('morgan')
const express = require('express')
const path = require('path')
const bodyparser = require('body-parser')
const mongoose = require('mongoose')
const fileupload = require('express-fileupload')
const passport = require('passport')
const LocalStorage = require('passport-local').Strategy
const session = require('express-session')
const bcrypt = require('bcrypt')

const User = require('./schema/User')
const Message = require('./schema/Message')

const MessagesController = require('./controllers/MessagesController')

const SALT_ROUNDS = 10

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

app.get('/signup', (_req, res, _next) => {
  return res.render('signup')
})

app.post('/signup', fileupload(), (req, res, next) => {
  const avatar = req.files.avatar
  avatar.mv('./avatar/' + avatar.name, err => {
    if (err) throw err

    bcrypt.genSalt(SALT_ROUNDS, (saltErr, salt) => {
      if (saltErr) throw saltErr

      bcrypt.hash(req.body.password, salt, (hashErr, hash) => {
        if (err) throw hashErr

        const newUser = new User({
          username: req.body.username,
          password: hash,
          avatar_path: '/avatar/' + avatar.name
        })
        newUser.save(err => {
          if (err) throw err

          return res.redirect('/')
        })
      })
    })
  })
})

app.get('/login', (_req, res, _next) => {
  return res.render('login')
})

app.post('/login', passport.authenticate('local'), (req, res, next) => {
  User.findOne({ _id: req.session.passport.user }, (err, user) => {
    if (err || !req.session) return res.redirect('/login')

    req.session.user = {
      username: user.username,
      avatar_path: user.avatar_path
    }
    return res.redirect('/')
  })
})

passport.use(new LocalStorage((username, password, done) => {
  User.findOne({ username: username }, (err, user) => {
    if (err) return done(err)
    if (!user) return done(null, false, { message: 'Incorrect username' })
    user.comparePassword(password, user.password, (err) => {
      if (err) return done(null, false, { message: 'Incorrect password' })

      return done(null, user)
    })
  })
}))

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser((id, done) => {
  User.findOne({ _id: id }, (err, user) => {
    done(err, user)
  })
})

app.get('/messages/new', MessagesController.index)
app.post('/messages', fileupload(), MessagesController.create)

const server = http.createServer(app)
server.listen(3000)
