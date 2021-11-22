const winston = require('winston')

const Logger = () => {
  return winston.add(winston.transports.File, {
    filename: 'log/development.log',
    maxsize: 1048576,
    level: 'debug'
  })
}

module.exports = new Logger()
