const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const providerCollaborator = new Schema({
  providerId: {
    type: mongoose.Types.ObjectId,
    ref: 'Person',
    required: true,
  },
  collaboratorId: {
    type: mongoose.Types.ObjectId,
    ref: 'Person',
    required: true,
  },
  commission: {
    type: Number,
    default: 0,
    require: false
  },
  state: {
    type: Boolean,
    required: true,
    default: true
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
}, {collection: 'providerCollaborators'});

module.exports = mongoose.model('ProviderCollaborator', providerCollaborator);
