const { Client, RemoteAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");

// Load the session data
mongoose.connect(process.env.MONGO_URI).then(() => {
  const store = new MongoStore({ mongoose: mongoose });
  const client = new Client({
     puppeteer: {
    headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-features=IsolateOrigins,site-per-process'
        ]
  },

    authStrategy: new RemoteAuth({
      store: store,
      backupSyncIntervalMs: 300000,
    }),
  });


  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", async () => {
    await new Promise((res) => setTimeout(res, 3000)); 

    let numeros = process.env.PHONE_NUMBER;
    numeros = numeros.split(",");

    const mensagem = process.argv[2];

    for (i = 0; i < numeros.length; i++) {
      const contato = numeros[i].trim() + "@c.us";
      await client
        .sendMessage(contato, mensagem)
        .then(() => console.log(`Mensagem enviada para ${contato}`))
        .catch((err) => console.error("Erro ao enviar mensagem:", err));
      await new Promise((res) => setTimeout(res, 1000));
    }
  });


  setTimeout(() => {
    console.warn("Timeout");
    client.destroy();
    process.exit(0);
  }, 60000);

  client.initialize();
});
