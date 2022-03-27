const { Schema } = require('mongoose')

module.exports = new Schema({
  user_id: String,
  username: String,
  name: String,
  rides_planned: [
    { type: Schema.Types.ObjectId, ref: 'Ride' },
  ],
  rides_participated: [
    { type: Schema.Types.ObjectId, ref: 'Ride' },
  ],
})
