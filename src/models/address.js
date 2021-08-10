const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const address = new Schema({

  personId: {
    type: mongoose.Types.ObjectId,
    ref: 'Person',
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  uf: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  publicPlace: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: 'BRAZIL'
  },
  
}, {collection: 'address'});

module.exports = mongoose.model('Address', address);
