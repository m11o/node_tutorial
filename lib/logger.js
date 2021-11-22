const winston = require('winston')

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'log/development.log',
      maxsize: 1048576,
      level: 'warn'
    })
  ]
})

module.exports = logger
