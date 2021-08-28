const express = require('express');
const router = express.Router();

const auth = require('../oauth/midware');
router.use(auth);

const Schedule = require('../models/schedule');
const Scheduling = require('../models/scheduling');
const Person = require('../models/person');
const Service = require('../models/service');

const moment = require('moment');
const mongoose = require('mongoose');
const _ = require('lodash');

const pagarme = require('../services/pagarme');
const keys = require('../data/keys.json');
const util = require('../util');

router.post('/filter', async (req, res) => {
  try {
    const { range, providerId } = req.body;

    const schedulings = await Scheduling.find({
      status: 'A',
      providerId,
      data: {
        $gte: moment(range.start).startOf('day'),
        $lte: moment(range.end).endOf('day'),
      },
    }).populate([
      { path: 'serviceId', select: 'titulo duracao' },
      { path: 'collaboratorId', select: 'nome' },
      { path: 'personId', select: 'nome' },
    ]);

    res.json({ error: false, schedulings });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.post('/', async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {
    const { personId, providerId, serviceId, collaboratorId } = req.body;

    const person = await Person.findById(personId).select(
      'nome endereco customerId'
    );
    /*const provider = await Provider.findById(providerId).select('recipientId')*/;
    const service = await Service.findById(serviceId).select(
      'preco titulo comissao'
    );
    /*const collaborator = await Collaborator.findById(collaboratorId).select(
      'recipientId'
    );*/

    // PREÇO TOTAL DA TRANSAÇÃO
    const precoFinal = util.toCents(service.preco) * 100;

    // REGRAS DE SPLIT DO COLABORADOR
    const collaboratoreSplitRule = {
      recipient_id: collaborator.recipientId,
      amount: parseInt(precoFinal * (service.comissao / 100)),
    };

    // CRIAR O AGENDAMENTOS E AS TRANSAÇÕES
    // TRANSFORMAR EM INSERT MANY
    let scheduling = req.body;
    scheduling = {
      ...scheduling,
     // transactionId: createPayment.data.id,
      comissao: service.comissao,
      valor: service.preco,
    };
    await new Scheduling(scheduling).save();

    await session.commitTransaction();
    session.endSession();
   // res.json({ error: false, scheduling: createPayment.data });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.json({ error: true, message: err.message });
  }
});

router.post('/dias-disponiveis', async (req, res) => {
  try {
    const { data, providerId, serviceId } = req.body;
    const schedules = await Schedule.find({ providerId });
    const service = await Service.findById(serviceId).select('duracao');
    let collaboratores = [];

    let agenda = [];
    let lastDay = moment(data);

    // DURAÇÃO DO SERVIÇO
    const serviceDuracao = util.hourToMinutes(
      moment(service.duracao).format('HH:mm')
    );
    const serviceDuracaoSlots = util.sliceMinutes(
      moment(service.duracao),
      moment(service.duracao).add(serviceDuracao, 'minutes'),
      util.SLOT_DURATION,
      false
    ).length;

    for (let i = 0; i <= 365 && agenda.length <= 7; i++) {
      const espacosValidos = schedules.filter((h) => {
        // VERIFICAR DIA DA SEMANA
        const diaSemanaDisponivel = h.dias.includes(moment(lastDay).day());

        // VERIFICAR ESPECIALIDADE DISPONÍVEL
        const servicesDisponiveis = h.especialidades.includes(serviceId);

        return diaSemanaDisponivel && servicesDisponiveis;
      });

      if (espacosValidos.length > 0) {
        // TODOS OS HORÁRIOS DISPONÍVEIS DAQUELE DIA
        let todosSchedulesDia = {};
        for (let espaco of espacosValidos) {
          for (let collaborator of espaco.collaboratores) {
            if (!todosSchedulesDia[collaborator._id]) {
              todosSchedulesDia[collaborator._id] = [];
            }
            todosSchedulesDia[collaborator._id] = [
              ...todosSchedulesDia[collaborator._id],
              ...util.sliceMinutes(
                util.mergeDateTime(lastDay, espaco.inicio),
                util.mergeDateTime(lastDay, espaco.fim),
                util.SLOT_DURATION
              ),
            ];
          }
        }

        // SE TODOS OS ESPECIALISTAS DISPONÍVEIS ESTIVEREM OCUPADOS NO HORÁRIO, REMOVER
        for (let collaboratorKey of Object.keys(todosSchedulesDia)) {
          // LER AGENDAMENTOS DAQUELE ESPECIALISTA NAQUELE DIA
          const schedulings = await Scheduling.find({
            collaboratorId: collaboratorKey,
            data: {
              $gte: moment(lastDay).startOf('day'),
              $lte: moment(lastDay).endOf('day'),
            },
          }).select('data -_id');

          // RECUPERANDO HORÁRIOS OCUPADOS
          let schedulesOcupado = schedulings.map((a) => ({
            inicio: moment(a.data),
            fim: moment(a.data).add(serviceDuracao, 'minutes'),
          }));

          schedulesOcupado = schedulesOcupado
            .map((h) =>
              util.sliceMinutes(h.inicio, h.fim, util.SLOT_DURATION, false)
            )
            .flat();

          // REMOVENDO TODOS OS HORÁRIOS QUE ESTÃO OCUPADOS
          let schedulesLivres = util.splitByValue(
            _.uniq(
              todosSchedulesDia[collaboratorKey].map((h) => {
                return schedulesOcupado.includes(h) ? '-' : h;
              })
            ),
            '-'
          );

          // VERIFICANDO SE NOS HORÁRIOS CONTINUOS EXISTE SPAÇO SUFICIENTE NO SLOT
          schedulesLivres = schedulesLivres
            .filter((h) => h.length >= serviceDuracaoSlots)
            .flat();

          /* VERIFICANDO OS HORÁRIOS DENTRO DO SLOT 
            QUE TENHAM A CONTINUIDADE NECESSÁRIA DO SERVIÇO
          */
          schedulesLivres = schedulesLivres.map((slot) =>
            slot.filter(
              (schedule, index) => slot.length - index >= serviceDuracaoSlots
            )
          );

          // SEPARANDO 2 EM 2
          schedulesLivres = _.chunk(schedulesLivres, 2);

          // REMOVENDO O COLABORADOR DO DIA, CASO NÃO TENHA ESPAÇOS NA AGENDA
          if (schedulesLivres.length === 0) {
            todosSchedulesDia = _.omit(todosSchedulesDia, collaboratorKey);
          } else {
            todosSchedulesDia[collaboratorKey] = schedulesLivres;
          }
        }

        // VERIFICANDO SE TEM ESPECIALISTA COMA AGENDA NAQUELE DIA
        const totalCollaboratores = Object.keys(todosSchedulesDia).length;

        if (totalCollaboratores > 0) {
          collaboratores.push(Object.keys(todosSchedulesDia));
          console.log(todosSchedulesDia);
          agenda.push({
            [moment(lastDay).format('YYYY-MM-DD')]: todosSchedulesDia,
          });
        }
      }

      lastDay = moment(lastDay).add(1, 'day');
    }

    /*collaboratores = await Collaborator.find({
      _id: { $in: _.uniq(collaboratores.flat()) },
    }).select('nome foto');*/

    collaboratores = collaboratores.map((c) => ({
      ...c._doc,
      nome: c.nome.split(' ')[0],
    }));

    res.json({ error: false, collaboratores, agenda });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
