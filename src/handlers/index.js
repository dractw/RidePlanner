const { Rider, Ride } = require('../db/models/index.js')

/**
 * Creates new ride
 * @param ride_params
 * @returns {Promise<Ride>}
 */
const createRide = ({ title, author, description, date, start_point, level, participants }) => {
  const ride = new Ride({ title, author, description, date, start_point, level, participants })

  ride.save()

  return ride._id
}

/**
 * Get ride by id
 * @param id
 * @returns {Promise<Ride>}
 */
const getRide = (id) => {
  return Ride.findOne({ _id: id })
}

const joinRide = (ride_id, user_id) => {
  return Ride.updateOne({ _id: ride_id }, { $addToSet: { participants: user_id } })
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
  const rider = new Rider({ user_id, name, username })

  rider.save()

  return rider
}

/**
 * Get existing user
 * @param id
 * @returns {Promise<*>}
 */
const getUserByTgId = (tg_id) => {
  return Rider.findOne({ user_id: tg_id })
}

const getUserById = (id) => {
  return Rider.findOne({ _id: id })
}

module.exports = {
  getAllRides,
  createRide,
  createUser,
  getUserById,
  getUserByTgId,
  getRide,
  joinRide,
}
