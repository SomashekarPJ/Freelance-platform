const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  title: String,
  description: String,
  budget: Number,
  client: { type: Schema.Types.ObjectId, ref: 'User' },
  acceptedBid: { type: Schema.Types.ObjectId, ref: 'Bid' },
  status: { type: String, enum: ['open','in_progress','completed','closed'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
