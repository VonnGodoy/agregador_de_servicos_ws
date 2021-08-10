const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Service = require('../models/service');

const auth = require('../oauth/midware');
router.use(auth);

router.post('/', async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {
    const personId = req.personId;
    
    const service  = req.body;

    service.personId = personId;

    const existent = await Service.findOne({ providerId: personId, name: service.name });

    if (!existent) {
      const _id = mongoose.Types.ObjectId();

      newService = await new Service({
        _id,
        ...service,
      }).save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    if ( existent ) {
      res.json({ error: true, message: 'Serviço já cadastrado!' });
    } else {
      res.json({ error: false });
    }

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.json({ error: true, message: err.message });
  }
});


router.get('/providerId/:providerId', async (req, res) => {
  try {
    let state = req.params.state ? req.params.state : true;
    
    const services = await Service.find({
      providerId: req.params.providerId, //implementar para pegar usuario logado
      state: state
    })

    res.json({
      error: false,
      data: services
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const service  = req.body;

    await Service.findByIdAndUpdate( service._id, service);
    
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/enable/:id', async (req, res) => {
  try {
    await Service.findByIdAndUpdate(req.params.id, { state: true });
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/disable/:id', async (req, res) => {
  try {
    await Service.findByIdAndUpdate(req.params.id, { state: false });
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
