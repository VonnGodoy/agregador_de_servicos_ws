const express = require('express');

const app = express();
app.use(express.json());

const morgan = require('morgan');
app.use(morgan('dev'));

const busboy = require('connect-busboy');
app.use(busboy());

const busboyBodyParser = require('busboy-body-parser');
app.use(busboyBodyParser());

const cors = require('cors');
app.use(cors());

app.set('port', process.env.PORT || 8000);

// DATABASE
require('./database');


/* ROTAS */
app.use('/auth', require('./src/routes/auth.routes'));
app.use('/person', require('./src/routes/person.routes'));
app.use('/address', require('./src/routes/address.routes'));
app.use('/contact', require('./src/routes/contact.routes'));
app.use('/service', require('./src/routes/service.routes'));

app.use('/collaborator', require('./src/routes/collaborator.routes'));
app.use('/schedule', require('./src/routes/schedule.routes'));
app.use('/scheduling', require('./src/routes/scheduling.routes'));

app.listen(app.get('port'), function () {
  console.log('WS escutando porta ' + app.get('port'));
});
