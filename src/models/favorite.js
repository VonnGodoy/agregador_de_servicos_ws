const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favorite = new Schema({
  personId: {
    type: Schema.Types.ObjectId,
    refPath: 'Person',
  },
  providerId: {
    type: Schema.Types.ObjectId,
    refPath: 'Person',
  }
}, {collection: 'favorites'});

module.exports = mongoose.model('favorite', favorite);