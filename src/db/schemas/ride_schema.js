const { Schema } = require('mongoose')

module.exports = new Schema({
  title: String,
  author: String,
  description: String,
  date: Date,
  region: String,
  start_point: String,
  level: String,
  private: Boolean,
  participants: [
    { type: Schema.Types.ObjectId, ref: 'Rider' },
  ],
})
