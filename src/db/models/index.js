const { model } = require('mongoose')
const { ride_schema, rider_schema } = require('../schemas')

const Ride = model('Ride', ride_schema)
const Rider = model('Rider', rider_schema)

module.exports = {
  Ride,
  Rider,
}
