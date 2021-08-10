const moment = require('moment');

module.exports = {
  SLOT_DURATION: 30, // MINUTOS
  isOpened: async (schedules) => {
    // VERIFICANDO SE EXISTE REGISTRO NAQUELE DIA DA SEMANA
    const schedulesDays = schedules.filter((s) => s.days.includes(moment().day()));
    if (schedulesDays.length > 0) {
      // VERIFICANDO HORARIOS
      for (let s of schedulesDays) {
        const start = moment(moment(s.startHour).format('HH:mm'), 'HH:mm:ss');
        const end = moment(moment(s.endHour).format('HH:mm'), 'HH:mm:ss');
        if (moment().isBetween(start, end)) {
          return true;
        }
      }
      return false;
    }
    return false;
  },

  toCents: (price) => {
    return parseInt(price.toString().replace('.', '').replace(',', ''));
  },

  mergeDateTime: (date, time) => {
    const merged = `${moment(date).format('YYYY-MM-DD')}T${moment(time).format(
      'HH:mm'
    )}`;
    return merged;
  },

  sliceMinutes: (start, end, duration, validation = true) => {
    let slices = [];
    count = 0;

    const now = moment();
    start = moment(start);
    end = moment(end);

    while (end > start) {
      if (
        start.format('YYYY-MM-DD') === now.format('YYYY-MM-DD') &&
        validation
      ) {
        if (start.isAfter(now)) {
          slices.push(start.format('HH:mm'));
        }
      } else {
        slices.push(start.format('HH:mm'));
      }

      start = start.add(duration, 'minutes');
      count++;
    }
    return slices;
  },

  hourToMinutes: (hourMinute) => {
    const [hour, minutes] = hourMinute.split(':');
    return parseInt(parseInt(hour) * 60 + parseInt(minutes));
  },
  
  splitByValue: (array, value) => {
    let newArray = [[]];
    array.forEach((item) => {
      if (item !== value) {
        newArray[newArray.length - 1].push(item);
      } else {
        newArray.push([]);
      }
    });
    return newArray;
  },
};
