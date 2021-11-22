const mongoose = require('mongoose')

const Message = mongoose.Schema({
  message: String,
  date: { type: Date, default: new Date() },
  image_path: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

module.exports = mongoose.model('Message', Message)
