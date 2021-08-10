const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.pagar.me/1',
});

const api_key = require('../data/keys.json').api_key;

module.exports = async (endpoint, data) => {

  const pagarmePerson = await pagarme('/customers', {
    external_id: _id,
    name: person.nome,
    type: person.documento.tipo === 'cpf' ? 'individual' : 'corporation',
    country: 'br',
    email: person.email,
    documents: [
      {
        type: person.documento.tipo,
        number: person.documento.numero,
      },
    ],
    phone_numbers: ['+55' + person.telefone],
    birthday: person.dataNascimento,
  });

  if (pagarmePerson.error) {
    throw pagarmePerson;
  }
  customerId: pagarmePerson.data.id

  try {
    const response = await api.post(endpoint, {
      api_key,
      ...data,
    });

    return { error: false, data: response.data };
  } catch (err) {
    return {
      error: true,
      message: JSON.stringify(err.response.data.errors[0]),
    };
  }

  const pagarmeBankAccount = await pagarme('/bank_accounts', {
    bank_code: contaBancaria.banco,
    document_number: contaBancaria.cpfCnpj,
    agencia: contaBancaria.agencia,
    conta: contaBancaria.numero,
    conta_dv: contaBancaria.dv,
    legal_name: contaBancaria.titular,
  });

  if (pagarmeBankAccount.error) {
    throw pagarmeBankAccount;
  }

      // CRIANDO PAGAMENTO MESTRE
      const createPayment = await pagarme('/transactions', {
        amount: precoFinal,
        card_number: '4111111111111111',
        card_cvv: '123',
        card_expiration_date: '0922',
        card_holder_name: 'Morpheus Fishburne',
        customer: {
          id: person.customerId,
        },
        billing: {
          // SUBISTITUIR COM OS DADOS DO CLIENTE
          name: person.nome,
          address: {
            country: person.endereco.pais.toLowerCase(),
            state: person.endereco.uf.toLowerCase(),
            city: person.endereco.cidade,
            street: person.endereco.logradouro,
            street_number: person.endereco.numero,
            zipcode: person.endereco.cep,
          },
        },
        items: [
          {
            id: serviceId,
            title: service.titulo,
            unit_price: precoFinal,
            quantity: 1,
            tangible: false,
          },
        ],
        split_rules: [
          // TAXA DO SALÃO
          {
            recipient_id: provider.recipientId,
            amount: precoFinal - keys.app_fee - collaboratoreSplitRule.amount,
          },
          // TAXAS DOS ESPECIALISTAS / COLABORADORES
          collaboratoreSplitRule,
          // TAXA DO APP
          {
            recipient_id: keys.recipient_id,
            amount: keys.app_fee,
            charge_processing_fee: false,
          },
        ],
      });
  
      if (createPayment.error) {
        throw { message: createPayment.message };
      }
  
      // CRIAR O AGENDAMENTOS E AS TRANSAÇÕES
      // TRANSFORMAR EM INSERT MANY
      let scheduling = req.body;
      scheduling = {
        ...scheduling,
        transactionId: createPayment.data.id,
        comissao: service.comissao,
        valor: service.preco,
      };

      const pargarmeReceiver = await pagarme('/recipients', {
        bank_account_id: pagarmeBankAccount.data.id,
        transfer_interval: 'daily',
        transfer_enabled: true,
      });

      if (pagarmeBankAccount.error) {
        throw pargarmeReceiver;
      }
};
