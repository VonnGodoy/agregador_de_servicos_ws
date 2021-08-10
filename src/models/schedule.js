const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schedule = new Schema({
  providerId: {
    type: mongoose.Types.ObjectId,
    ref: 'Person',
    required: true,
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
    enum: ['Empresa', 'Colaborador'],
    required: false,
  },
  state: {
    type: Boolean,
    require: true,
    defaut: true
  }
}, {collection: 'schedules'});

module.exports = mongoose.model('Schedule', schedule);
