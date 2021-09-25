const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const auth = require('../oauth/midware');
router.use(auth);

const Schedule = require('../models/schedule');

router.post('/', async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {
    const personId = req.personId;
    const schedule  = req.body;

    schedule.providerId = personId;

    const existent = await Schedule.findOne({ providerId: personId });

    if (!existent) {
      const _id = mongoose.Types.ObjectId();

      console.log('schedule : ',schedule);
      
      newService = await new Schedule({
        _id,
        ...schedule,
      }).save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    if ( existent ) {
      res.json({ error: true, message: 'Prestador de serviço Já Cadastrado!' });
    } else {
      res.json({ error: false });
    }

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.json({ error: true, message: err.message });
  }
});

router.post('/filter', async (req, res) => {
  try {

    const filter = req.body;

    const schedule = await Schedule.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: filter.coordinates,
          },
          distanceField: 'geoLocation',
          spherical: true,
          maxDistance: filter.maxDistance * 1000,
        },
      }],
    )
    .select('_id name socialReason geoLocation dateRegister state');;

    res.json({ error: false, data: schedule });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id  = req.params.id;

    const schedule = await Schedule.findById( id );

    res.json({ error: false, data: schedule });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const schedule = req.body;

    await Schedule.findByIdAndUpdate(schedule._id, schedule);

    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/enable/:id', async (req, res) => {
  try {
    await Schedule.findByIdAndUpdate(req.params.id, { state: true });
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/disable/:id', async (req, res) => {
  try {
    await Schedule.findByIdAndUpdate(req.params.id, { state: false });
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
