const User = require('../schema/User')
const Message = require('../schema/Message')

module.exports = {
  index: (_req, res, _next) => {
    return res.render('messages/new')
  },
  create: (req, res, next) => {
    User.findById(req.session.passport.user, (err, user) => {
      if (err) next(err)

      let messageParams = {
        user: user._id,
        message: req.body.message
      }

      if (req.files && req.files.image) {
        const image = req.files.image
        image.mv('./image/' + image.name, err => {
          if (err) throw err
          messageParams.image_path = '/image/' + image.name
        })
      }

      const newMessage = new Message(messageParams)

      newMessage.save(createErr => {
        if (createErr) throw createErr

        return res.redirect('/')
      })
    })
  }
}
