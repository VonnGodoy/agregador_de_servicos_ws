const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const service = new Schema({
  providerId: {
    type: mongoose.Types.ObjectId,
    ref: 'Person',
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  timeExecution: {
    type: Date,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  state: {
    type: Boolean,
    required: true,
    default: true,
  },
  dateRegister: {
    type: Date,
    default: Date.now,
  },
}, {collection: 'services'});

module.exports = mongoose.model('Service', service);
