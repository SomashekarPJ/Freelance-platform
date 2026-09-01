const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BidSchema = new Schema({
  job: { type: Schema.Types.ObjectId, ref: 'Job' },
  freelancer: { type: Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  coverLetter: String,
  accepted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Bid', BidSchema);
