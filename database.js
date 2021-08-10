const mongoose = require('mongoose');

const URI = 'mongodb+srv://prestador_de_servicos_user:lYC9lxEmq0AGjTai@clusterdev.m2ntq.mongodb.net/prestador_de_servicos?retryWrites=true&w=majority';

const env = process.env.NODE_ENV || 'dev';
let options = {};

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose
  .connect(URI, options)
  .then(() => console.log('DB is Up!'))
  .catch((err) => console.log(err));
