const mongoose = require('mongoose')

const User = mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  date: { type: Date, default: new Date() },
  avatar_path: String
})

module.exports = mongoose.model('User', User)
