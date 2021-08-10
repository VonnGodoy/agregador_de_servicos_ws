const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contact = new Schema({
 
  personId: {
    type: mongoose.Types.ObjectId,
    ref: 'Person',
    required: true,
  },
  decription: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['Celular', 'Tel Residencial', 'Tel Comercial', 'Email'],
    required: true,
  },
  principal: {
    type: Boolean,
    default: false,
  },
  whatsApp: {
    type: String,
    required: true,
  },
 
}, {collection: 'contacts'});

module.exports = mongoose.model('Contact', contact);
