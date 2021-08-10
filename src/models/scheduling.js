const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scheduling = new Schema({
  clientId: {
    type: mongoose.Types.ObjectId,
    ref: 'Person',
    required: true,
  },
  providerId: {
    type: mongoose.Types.ObjectId,
    ref: 'Person',
    required: true,
  },
  serviceId: {
    type: mongoose.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  collaboratorId: {
    type: mongoose.Types.ObjectId,
    ref: 'Collaborator',
    required: false,
  },
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: false,
  },
  state: {
    type: String,
    enum: ['Agendado', 'Cancelado','Concluido'],
    required: true,
    default: 'Agendado',
  },
  transactionId: {
    type: String,
    required: false,
  },
  dateRegister: {
    type: Date,
    default: Date.now,
  },
}, {collection: 'Schedulings'});

module.exports = mongoose.model('Scheduling', scheduling);
