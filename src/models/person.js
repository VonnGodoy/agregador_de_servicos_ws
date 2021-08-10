const { stubFalse } = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const person = new Schema({

  name: {
    type: String,
    required: true,
  },
  socialReason: {
    type: String,
    required: false,
  },
  document: {
    type: String,
    required: true,
    unique:true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  recipientId: {
    type: String,
    required: false,
  },
  geoLocation: {
    type: [String],
    coordinates: [String],
  },
  dateRegister: {
    type: Date,
    default: Date.now,
  },
  birthDate: {
    type: String,
    required: false,
  },
  sex: {
    type: String,
    enum: ['M', 'F'],
    required: false,
  },
  state: {
    type: Boolean,
    default: true,
  },
  files: {
    type: [{ type: mongoose.Types.ObjectId, ref: 'File' }],
    required: false,
  },
  address: {
    type: [{ type: mongoose.Types.ObjectId, ref: 'Address' }],
    required: false,
  },
  contacts: {
    type: [{ type: mongoose.Types.ObjectId, ref: 'Contact' }],
    required: false,
  },
  collaborators: {
    type: [{ type: mongoose.Types.ObjectId, ref: 'ProviderCollaborator' }],
    required: false,
  },
}, {collection: 'persons'});

module.exports = mongoose.model('Person', person);
