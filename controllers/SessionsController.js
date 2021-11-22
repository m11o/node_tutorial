const User = require('../schema/User')

module.exports = {
  new: (_req, res, _next) => {
    return res.render('sessions/new')
  },
  create: (req, res, _next) => {
    User.findOne({ _id: req.session.passport.user }, (err, user) => {
      if (err || !req.session) return res.redirect('/login')

      req.session.user = {
        username: user.username,
        avatar_path: user.avatar_path
      }
      return res.redirect('/')
    })
  }
}
