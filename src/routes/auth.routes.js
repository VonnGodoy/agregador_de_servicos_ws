
const express = require('express')
const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
const fs = require('fs');

const Person = require('../models/person');


router.post('/signup', async (req, res) => {

        const person = req.body;

        const existent = await getUser(person);

        if (!existent) {
           let newPerson = createUser(person);
           res.json({ error: false, user: newPerson, token: sign(newPerson._id) });
        } else {
            res.json({ error: true, message: 'Usuario já cadastrado!' }); 
        }

})


router.post('/login', async (req, res) => {

    const person = req.body;

    const user = await getUser(person);

    if (!user) {
        res.json({ error: false, message: 'Usuário ou Senha Incorreto' });
    } else {
        res.json({ error: false, user: user, token: sign(user._id) });
    }
})


router.post('/logout', function (req, res) {

    res.status(200).send({ auth: false, token: null });
});

router.post('/refresh', async (req, res) => {

    var user = null;

    const token = req.headers['x_access_jwt_token'];

    if (!token){
        return res.status(401).send({ error: true, message: 'Usuario Não Autenticado.' });
    }

    var publicKey = fs.readFileSync('src/oauth/public.key', 'utf8');
    jwt.verify(token, publicKey, { algorithm: ["RS256"] },async function (err, decoded) {

        if(decoded._id !== undefined){       
           user = await getUserRefresh(decoded._id);
        }
                    
    });

    if (!user) {
        res.json({ error: true, message: 'Usuario Não Autenticado.' });
    } else {
        res.json({ error: false, user: user, token: sign(user._id) });
    }
})


function sign(_id) {

    var privateKey = fs.readFileSync('src/oauth/private.key', 'utf8');
    return jwt.sign({ _id }, privateKey, {
        expiresIn: 900, // 15min 
        algorithm: "RS256"
    });

}

async function getUserRefresh(personId) {
    return await Person.findById(personId)
    .select('_id name geoLocation state');
}

async function getUser(person) {
    return await Person.findOne({ document: person.document, password: person.password })
    .select('_id name geoLocation state');
}

async function createUser(person) {

    const db = mongoose.connection;
    const session = await db.startSession();
    session.startTransaction();

    try {

        const _id = mongoose.Types.ObjectId();
        let newPerson = await new Person({
            _id,
            ...person,
        }).save({ session });


        await session.commitTransaction();
        session.endSession();

        return newPerson;

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
    }
}

module.exports = router;
