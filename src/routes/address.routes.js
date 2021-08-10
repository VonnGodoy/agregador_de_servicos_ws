const express = require('express');
const moment = require('moment');

const router = express.Router();
const mongoose = require('mongoose');
const Address = require('../models/address');

const auth = require('../oauth/midware');
router.use(auth);

router.post('/', async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {
    const address  = req.body;

    let newAddress = null;

    const existent = await Address.findOne({ personId: address.personId, publicPlace: address.publicPlace, zipCode: address.zipCode });

    if (!existent) {
      const _id = mongoose.Types.ObjectId();

      newAddress = await new Address({
        _id,
        ...address,
      }).save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    if ( existent ) {
      res.json({ error: true, message: 'Endereco já cadastrado!' });
    } else {
      res.json({ error: false });
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.json({ error: true, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {

    const address = await Address.findById(req.params.id);
    
    res.json({
      error: false,
      data: address
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.get('/personId/:personId', async (req, res) => {
  try {
    const addresss = await Address.find({ personId: req.params.personId });

    res.json({
      error: false,
      data: addresss
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {

    await Address.findByIdAndDelete(req.params.id);

    res.json({
      error: false,
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
