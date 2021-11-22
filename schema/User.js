const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const User = mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  date: { type: Date, default: new Date() },
  avatar_path: String
})

User.methods.comparePassword = (candidatePassword, hash, next) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => next(err, isMatch))
}

module.exports = mongoose.model('User', User)
