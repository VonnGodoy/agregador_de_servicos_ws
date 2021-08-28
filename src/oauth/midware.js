const jwt = require('jsonwebtoken');
const fs = require('fs');

function verifyjwt(req,res,next){
    var token = req.headers['X-Access-Jwt-Token'];
    if (!token)
        return res.status(401).send({ error: true, message: 'Usuario Não Autenticado.' });

    var publicKey = fs.readFileSync('src/oauth/public.key', 'utf8');
    jwt.verify(token, publicKey, { algorithm: ["RS256"] }, function (err, decoded) {
        if (err)
            return res.status(403).send({ error: true, message: 'Token Inválido Faça Login Novamente.' });

        req.params.personId = decoded.id;

        next();
    });
}

module.exports = verifyjwt