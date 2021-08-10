const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const auth = require('../oauth/midware');
router.use(auth);

const moment = require('moment');

const Contact = require('../models/contact');

router.post('/', async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {
    const contact  = req.body;

    let newContact = null;

    const existent = await Contact.findOne({ personId: contact.personId, decription: contact.decription });

    if (!existent) {
      const _id = mongoose.Types.ObjectId();

      newContact = await new Contact({
        _id,
        ...contact,
      }).save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    if ( existent ) {
      res.json({ error: true, message: 'Contato já cadastrado!' });
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

    const contact = await Contact.findById(req.params.id);
    
    res.json({
      error: false,
      data: contact
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.get('/personId/:personId', async (req, res) => {
  try {
    const contacts = await Contact.find({ personId: req.params.personId });

    res.json({
      error: false,
      data: contacts
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {

    await Contact.findByIdAndDelete(req.params.id);

    res.json({
      error: false,
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
