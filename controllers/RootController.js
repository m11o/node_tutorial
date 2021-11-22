const Message = require('../schema/Message')

module.exports = {
  index: (req, res, _next) => {
    Message.find({ user: req.session.passport.user }, (err, msgs) => {
      if (err) throw err
      return res.render('root/index', {
        messages: msgs,
        user: req.session && req.session.user ? req.session.user : null
      })
    })
  }
}
