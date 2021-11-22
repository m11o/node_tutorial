const LocalStorage = require('passport-local').Strategy

const User = require('../schema/User')

module.exports = (passport) => {
  passport.use(new LocalStorage((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) return done(err)
      if (!user) return done(null, false, { message: 'Incorrect username' })
      user.comparePassword(password, user.password, (err, isMatch) => {
        if (err || !isMatch) return done(null, false, { message: 'Incorrect password' })

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
}
