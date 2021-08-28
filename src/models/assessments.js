const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assessments = new Schema({
  personId: {
    type: Schema.Types.ObjectId,
    refPath: 'Person',
  },
  providerId: {
    type: Schema.Types.ObjectId,
    refPath: 'Person',
  },
  note: {
    type: Number,
    required: true,
    detaut: 0
  },
  comment: {
    type: String,
    required: false
  }
}, {collection: 'assessments'});

module.exports = mongoose.model('assessments', assessments);