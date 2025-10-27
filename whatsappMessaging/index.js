require('dotenv').config();
const { Client, RemoteAuth } = require('whatsapp-web.js');
const mongoose = require('mongoose');
const { MongoStore } = require('wwebjs-mongo');
const qrcode = require('qrcode-terminal');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conectado ao MongoDB');

    const store = new MongoStore({ mongoose });

    const client = new Client({
      authStrategy: new RemoteAuth({
        store,
        clientId: 'bot-metrosp',  
        backupSyncIntervalMs: 300_000
      }),
      puppeteer: { headless: true }
    });

    client.on('qr', qr => {
      qrcode.generate(qr, { small: true });
      console.log('Escaneie o QR acima');
    });

    client.on('ready', async () => {
      console.log('✅ WhatsApp conectado!');

      const chats = await client.getChats();
      const grupo = chats.find(c => c.isGroup && c.name === "Metro SP");

      if (!grupo) {
        console.log("Grupo não encontrado!");
        return;
      }

      const mensagem = process.argv[2];
      await client.sendMessage(grupo.id._serialized, mensagem);
      console.log("✅ Mensagem enviada!");
    });

    client.on('message_ack', (msg, ack) => {
      if (ack === 1) {
        client.destroy();
        process.exit(0);
      }
    });

    await client.initialize();
  } catch (err) {
    console.error('Erro ao iniciar:', err);
  }
})();
