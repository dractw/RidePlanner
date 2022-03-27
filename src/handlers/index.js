const { Rider, Ride } = require('../db/models/index.js')

/**
 * Creates new ride
 * @param ride_params
 * @returns {Promise<Ride>}
 */
const createRide = (ride_params) => {
  return new Ride(ride_params).save()
}

/**
 * Get ride by id
 * @param id
 * @returns {Promise<Ride>}
 */
const getRide = (id) => {
  return Ride.findOne({ _id: id })
}

/**
 * Return all rides
 * @returns Promise<Array<Ride>>
 * @param before_date Date
 */
const getAllRides = (before_date) => {
  const date_param = before_date ? { date: before_date } : {}

  return Ride.find(date_param)
}

/**
 * Create new user or update existing
 * @param user_id
 * @param name
 * @param username
 * @returns {Promise<*>}
 */
const createUser = ({ user_id, name, username }) => {
  return Rider.findOneAndUpdate({ user_id, name, username }, { upsert: true })
}

/**
 * Get existing user
 * @param id
 * @returns {Promise<*>}
 */
const getUser = (id) => {
  return Rider.findOne({ user_id: id })
}

module.exports = {
  getAllRides,
  createRide,
  createUser,
  getUser,
  getRide,
}
