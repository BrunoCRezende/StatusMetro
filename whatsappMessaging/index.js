const { Client, RemoteAuth } = require('whatsapp-web.js');
const mongoose = require('mongoose');
const { MongoStore } = require('wwebjs-mongo');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB via Mongoose!');
    // 2️⃣ Cria o store oficial do wwebjs-mongo
    const store = new MongoStore({ mongoose });

    const client = new Client({
      authStrategy: new RemoteAuth({
        store,
        clientId: 'bot-metrosp',
        backupSyncIntervalMs: 60_000
      }),
    });

    client.on('qr', qr => {
      qrcode.generate(qr, { small: true });
      console.log('Escaneie o QR');
    });

    client.on('authenticated', () => {
      console.log('Sessão autenticada');
    });

    client.on('ready', async () => {
      console.log('WhatsApp conectado');

      const chats = await client.getChats();
      const grupo = chats.find(c => c.isGroup && c.name === "Metro SP");

      if (!grupo) {
        console.log("Grupo não encontrado");
        client.destroy();
        process.exit(0);
      }

      const mensagem = process.argv[2];

      const sentMsg = await client.sendMessage(grupo.id._serialized, mensagem);
      console.log("Mensagem enviada");

      client.on('message_ack', (msg, ack) => {
        if (msg.id._serialized === sentMsg.id._serialized && ack >= 1) {
          client.destroy();
          process.exit(0);
        }
      });
    });

    client.on('disconnected', reason => {
      console.log('⚠️ Cliente desconectado:', reason);
      process.exit(0);
    });

    await client.initialize();

  } catch (err) {
    console.error('❌ Erro ao iniciar o bot:', err);
    process.exit(1);
  }
})();
