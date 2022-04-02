const { Schema } = require('mongoose')

module.exports = new Schema({
  title: String,
  author: Schema.Types.ObjectId,
  description: String,
  date: Date,
  start_point: String,
  level: String,
  participants: [
    { type: Schema.Types.ObjectId, ref: 'Rider' },
  ],
})
