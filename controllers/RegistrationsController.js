const bcrypt = require('bcrypt')

const User = require('../schema/User')

const SALT_ROUNDS = 10

module.exports = {
  new: (_req, res, _next) => {
    return res.render('registrations/new')
  },
  create: (req, res, _next) => {
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
  }
}
