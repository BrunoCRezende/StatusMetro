const { Client, RemoteAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');

// Load the session data
mongoose.connect(process.env.MONGO_URI).then(() => {
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
    puppeteer: {
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        })
        
    });


    client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  await new Promise(res => setTimeout(res, 3000)); // espera 3 segundos

  let numeros = process.env.PHONE_NUMBER;
  numeros = numeros.split(',');

  const mensagem = process.argv[2];

  for (i = 0; i < numeros.length; i++) {
    const contato = numeros[i].trim() + '@c.us';
      await client.sendMessage(contato, mensagem)
      .then(() => console.log(`✉️ Mensagem enviada para ${contato}`))
      .catch(err => console.error('Erro ao enviar mensagem:', err));

      if (i === numeros.length) {
        await new Promise(res => setTimeout(res, 3000)); // espera 3 segundos
        client.destroy();
      }
  }
});

client.on('message_ack', (msg, ack) => {
    if (ack === 1) {
        client.destroy();
        process.exit(0);
    }
});

    client.initialize();
});







