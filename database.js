const mongoose = require('mongoose');

let options = {};

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose
  .connect(process.env.URL_MOGO, options)
  .then(() => console.log('DB is Up!'))
  .catch((err) => console.log(err));
