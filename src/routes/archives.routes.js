const express = require('express');
const router = express.Router();
const Schedule = require('../models/schedule');
const Agendamento = require('../models/scheduling');
const Person = require('../models/person');
const Provider = require('../models/Provider');
const Service = require('../models/service');
const Collaborator = require('../models/collaborator');

const moment = require('moment');
const mongoose = require('mongoose');
const _ = require('lodash');

const pagarme = require('../services/pagarme');
const keys = require('../data/keys.json');
const util = require('../util');

const auth = require('../oauth/midware');
router.use(auth);

router.post('/', async (req, res) => {
  var busboy = new Busboy({ headers: req.headers });
  busboy.on('finish', async () => {
    try {
      let errors = [];
      let arquivos = [];

      if (req.files && Object.keys(req.files).length > 0) {
        for (let key of Object.keys(req.files)) {
          const file = req.files[key];

          const nameParts = file.name.split('.');
          const fileName = `${new Date().getTime()}.${
            nameParts[nameParts.length - 1]
          }`;
          const path = `services/${req.body.providerId}/${fileName}`;

          const response = await aws.Vic(
            file,
            path
            //, acl = https://docs.aws.amazon.com/pt_br/AmazonS3/latest/dev/acl-overview.html
          );

          if (response.error) {
            errors.push({ error: true, message: response.message.message });
          } else {
            arquivos.push(path);
          }
        }
      }

      if (errors.length > 0) {
        res.json(errors[0]);
        return false;
      }

      // CRIAR SERVIÇO
      let jsonService = JSON.parse(req.body.service);
      jsonService.providerId = req.body.providerId;
      const service = await new Service(jsonService).save();

      // CRIAR ARQUIVO
      arquivos = arquivos.map((arquivo) => ({
        referenciaId: service._id,
        model: 'Service',
        arquivo,
      }));
      await Arquivos.insertMany(arquivos);

      res.json({ error: false, arquivos });
    } catch (err) {
      res.json({ error: true, message: err.message });
    }
  });
  req.pipe(busboy);
});

router.put('/:id', async (req, res) => {
  var busboy = new Busboy({ headers: req.headers });
  busboy.on('finish', async () => {
    try {
      let errors = [];
      let arquivos = [];

      if (req.files && Object.keys(req.files).length > 0) {
        for (let key of Object.keys(req.files)) {
          const file = req.files[key];

          const nameParts = file.name.split('.');
          const fileName = `${new Date().getTime()}.${nameParts[nameParts.length - 1]
            }`;
          const path = `services/${req.body.providerId}/${fileName}`;

          const response = await aws.uploadToS3(
            file,
            path
            //, acl = https://docs.aws.amazon.com/pt_br/AmazonS3/latest/dev/acl-overview.html
          );

          if (response.error) {
            errors.push({ error: true, message: response.message.message });
          } else {
            arquivos.push(path);
          }
        }
      }

      if (errors.length > 0) {
        res.json(errors[0]);
        return false;
      }

      //  ATUALIZAR SERVIÇO
      let jsonService = JSON.parse(req.body.service);
      await Service.findByIdAndUpdate(req.params.id, jsonService);

      // CRIAR ARQUIVO
      arquivos = arquivos.map((arquivo) => ({
        referenciaId: req.params.id,
        model: 'Service',
        arquivo,
      }));
      await Arquivos.insertMany(arquivos);

      res.json({ error: false });
    } catch (err) {
      res.json({ error: true, message: err.message });
    }
  });
  req.pipe(busboy);
});

/*
  FAZER NA #01
*/
router.post('/remove-arquivo', async (req, res) => {
    try {
      const { arquivo } = req.body;
  
      // EXCLUIR DA AWS
      await aws.deleteFileS3(arquivo);
  
      // EXCLUIR DO BANCO DE DADOS
      await Arquivos.findOneAndDelete({
        arquivo,
      });
  
      res.json({ error: false, message: 'Erro ao excluir o arquivo!' });
    } catch (err) {
      res.json({ error: true, message: err.message });
    }
  });
  