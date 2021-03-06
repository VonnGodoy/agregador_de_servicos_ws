const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schedule = new Schema({
  providerId: {
    type: mongoose.Types.ObjectId,
    ref: 'Person',
    required: true,
  },
  categoryId: {
    type: mongoose.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  socialReason: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  geoLocation: {
    type: { type: String },
    coordinates: [],
  },
  daysWeek: {
    type: [Number],
    required: true,
  },
  startHour: {
    type: Date,
    required: true,
  },
  endHour: {
    type: Date,
    required: true,
  },
  propertySchedule: {
    type: String,
    enum: ['E', 'C'],
    required: false,
  },
  state: {
    type: Boolean,
    require: true,
    defaut: true
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
  }
}, {collection: 'schedules'});

schedule.index({ geoLocation: '2dsphere' });

module.exports = mongoose.model('Schedule', schedule);
