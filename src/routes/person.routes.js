const express = require('express');
const mongoose = require('mongoose');

const auth = require('../oauth/midware');
const router = express.Router();
router.use(auth);

const Person = require('../models/person');
const Favorite = require('../models/favorite');

router.post('/', async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {
    const person  = req.body;

    let newPerson = null;

    const existent = await Person.findOne({ document: person.document });

    if (!existent) {
      const _id = mongoose.Types.ObjectId();

      newPerson = await new Person({
        _id,
        ...person,
      }).save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    if ( existent ) {
      res.json({ error: true, message: 'Usuario já cadastrado!' });
    } else {
      res.json({ error: false });
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.json({ error: true, message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {

    const persons = await Person.find()
    .select('_id name dateRegister birthDate sex state');
    
    res.json({
      error: false,
      data: persons
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {

    const person = await Person.findById(req.params.id)
    .select('_id name dateRegister birthDate sex state');
    
    res.json({
      error: false,
      data: person
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.get('/document/:document', async (req, res) => {
  try {
    const person = await Person.findOne({ document: req.params.document })
    .select('_id name dateRegister birthDate sex state');

    res.json({
      error: false,
      data: person
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const person = req.body;

    await Person.findByIdAndUpdate(person._id, person);
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/enable/:id', async (req, res) => {
  try {
    await Person.findByIdAndUpdate(req.params.id, { state: true });
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/disable/:id', async (req, res) => {
  try {
    await Person.findByIdAndUpdate(req.params.id, { state: false });
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.post('/favorite/:id', async (req, res) => {
  try {
    const favorite = await Favorite.findOne({personId: req.params.personId, providerId: req.params.id});


    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }

  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {

    const typeOperation = '';
    const favorite = await Favorite.findOne({personId: req.params.personId, providerId: req.params.id});

    if (!favorite) {
      typeOperation = 'Create';
      const _id = mongoose.Types.ObjectId();

      newPerson = await new Favorite({
        _id,
        personId: req.params.personId,
        providerId: req.params.id
      }).save({ session });

    } else {
      typeOperation = 'Delete';
      await Favorite.findByIdAndDelete(favorite._id);
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ error: true, message: typeOperation === 'Create' ? 'Adicionado Aos Favoritos' : 'Removido dos Favoritos' });
     
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.json({ error: true, message: err.message });
  }
});

router.get('/favorites', async (req, res) => {
  try {

    const favorites = await Favorite.find({ personId: req.params.personId })
    .populate({ path:'providerId' ,select:'_id name' });
    
    res.json({
      error: false,
      data: favorites
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
