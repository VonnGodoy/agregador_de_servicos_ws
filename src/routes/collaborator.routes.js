const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const auth = require('../oauth/midware');
router.use(auth);

const ProviderCollaborator = require('../models/relationship/providerCollaborator');


router.post('/', async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {
    const collaborator = req.body;
    let newCollaborator = null;

    const existentCollaborator = await ProviderCollaborator.findOne(
      { providerId: collaborator.providerId , 
        collaboratorId: collaborator.collaboratorId
      });

    if (!existentCollaborator) {
      newCollaborator = await new ProviderCollaborator(
        collaborator
        ).save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    if (existentCollaborator) {
      res.json({ error: true, message: 'Collaborator já cadastrado!' });
    } else {
      res.json({ error: false , data: newCollaborator});
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.json({ error: true, message: err.message });
  }
});

router.get('/:providerId', async (req, res) => {
  try {

    let state = req.params.state ? req.params.state : true;
    
    const colaborators = await ProviderCollaborator.find({
      providerId: req.params.providerId,
      state: state
    }).populate({ path:'collaboratorId' ,select:'-senha' });

    res.json({
      error: false,
      data: colaborators
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/', async (req, res) => {
  try {

    const collaborator = req.body;

    await ProviderCollaborator.findByIdAndUpdate(collaborator._id, collaborator);
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/enable/:id', async (req, res) => {
  try {
    await ProviderCollaborator.findByIdAndUpdate(req.params.id, { state: true});
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/disable/:id', async (req, res) => {
  try {
    await ProviderCollaborator.findByIdAndUpdate(req.params.id, { state: false});
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});


module.exports = router;
