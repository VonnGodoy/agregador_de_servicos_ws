const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const file = new Schema({
  personId: {
    type: Schema.Types.ObjectId,
    refPath: 'Person',
  },
  type: {
    type: String,
    required: true,
    enum: ['Avatar', 'Swiper'],
  },
  archive: {
    type: String,
    required: true,
  },
}, {collection: 'files'});

module.exports = mongoose.model('File', file);
