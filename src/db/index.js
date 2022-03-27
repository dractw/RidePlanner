const mongoose = require('mongoose')

const create_db_connection = () => {
  const { MONGO_HOST, MONGO_PORT_NUMBER, MONGO_DATABASE, MONGO_USER, MONGO_PASSWORD } = process.env

  return mongoose.connect(
    `mongodb://${MONGO_HOST}:${MONGO_PORT_NUMBER}/${MONGO_DATABASE}`,
    {
      user: MONGO_USER,
      pass: MONGO_PASSWORD,
    },
  )
}

module.exports = {
  create_db_connection,
}
