const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContractSchema = new Schema({
  job: { type: Schema.Types.ObjectId, ref: 'Job' },
  bid: { type: Schema.Types.ObjectId, ref: 'Bid' },
  client: { type: Schema.Types.ObjectId, ref: 'User' },
  freelancer: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending','active','delivered','approved','cancelled'], default: 'pending' },
  paid: { type: Boolean, default: false },
  paymentIntent: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Contract', ContractSchema);

