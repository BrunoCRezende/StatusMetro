// index.js
const { Client, RemoteAuth /*, LocalAuth */ } = require('whatsapp-web.js');
const mongoose = require('mongoose');
const { MongoStore } = require('wwebjs-mongo');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const CLIENT_ID = process.env.CLIENT_ID || 'bot-metrosp';
const GROUP_NAME = process.env.GROUP_NAME || 'Metro SP';
const MAX_SEND_RETRIES = 3;
const ACK_WAIT_MS = 30_000; 

(async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI não definido no .env');
    }

    await mongoose.connect(MONGO_URI);
    console.log('Conectado ao MongoDB');

    const store = new MongoStore({ mongoose });

    const client = new Client({
      authStrategy: new RemoteAuth({
        store,
        clientId: CLIENT_ID,
        backupSyncIntervalMs: 60_000 
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    client.on('qr', qr => {
      qrcode.generate(qr, { small: true });
      console.log('Escaneie o QR');
    });

    client.on('authenticated', () => {
      console.log('Sessão autenticada');
    });

    client.on('auth_failure', msg => {
      console.error('Falha na autenticação:', msg);
    });

    client.on('disconnected', reason => {
      console.warn('Cliente desconectado:', reason);
      process.exit(0);
    });

    client.on('ready', async () => {
      try {

        await new Promise(r => setTimeout(r, 3000));

        const chats = await client.getChats();
        const grupo = chats.find(c => c.isGroup && c.name === GROUP_NAME);

        if (!grupo) {
          console.log(`Grupo "${GROUP_NAME}" não encontrado. Listando grupos encontrados:`);
          chats.filter(c => c.isGroup).forEach(g => console.log('-', g.name));
          await client.destroy();
          process.exit(0);
        }

        const mensagem = process.argv.slice(2).join(' ');
        if (!mensagem || mensagem.trim().length === 0) {
          console.error('Mensagem vazia.');
          await client.destroy();
          process.exit(1);
        }

        async function trySend(retries = MAX_SEND_RETRIES) {
          let attempt = 0;
          while (attempt < retries) {
            attempt++;
            try {
              console.log(`Enviando mensagem (tentativa ${attempt}/${retries})...`);
              const sentMsg = await client.sendMessage(grupo.id._serialized, mensagem);

              console.log('Mensagem enviada (id):', sentMsg.id._serialized);

              await awaitAckOrTimeout(sentMsg, ACK_WAIT_MS);

              return sentMsg;
            } catch (err) {
              console.warn(`Falha ao enviar (tentativa ${attempt}):`, err && err.message ? err.message : err);
              if (attempt < retries) {
                const wait = 1000 * attempt; 
                console.log(`Aguardando ${wait}ms antes de nova tentativa...`);
                await new Promise(r => setTimeout(r, wait));
              } else {
                throw err;
              }
            }
          }
        }

        function awaitAckOrTimeout(sentMsg, timeoutMs) {
          return new Promise((resolve, reject) => {
            let finished = false;

            const onAck = (msg, ack) => {
              try {
                if (msg.id && sentMsg.id && msg.id._serialized === sentMsg.id._serialized) {
                  if (ack >= 1) {
                    finished = true;
                    client.removeListener('message_ack', onAck);
                    resolve({ ack });
                  }
                }
              } catch (e) {
              }
            };

            client.on('message_ack', onAck);

            const timeout = setTimeout(() => {
              if (!finished) {
                client.removeListener('message_ack', onAck);
                console.warn('Timeout aguardando ack da mensagem');
                resolve({ ack: 0, timeout: true });
              }
            }, timeoutMs);
          });
        }

        try {
          const sent = await trySend();
          console.log('Processo finalizado');
        } catch (err) {
          console.error('Não foi possível enviar a mensagem após tentativas:', err && err.message ? err.message : err);
        } finally {
          await new Promise(r => setTimeout(r, 500));
          await client.destroy();
          process.exit(0);
        }

      } catch (err) {
        console.error('Erro no handler ready:', err);
        await client.destroy();
        process.exit(1);
      }
    });

    await client.initialize();

  } catch (err) {
    console.error('Erro ao iniciar o bot:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
