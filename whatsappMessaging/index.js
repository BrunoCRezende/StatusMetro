const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');


const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {

  const chats = await client.getChats();
  const grupo = chats.find(c => c.isGroup && c.name === "Metro SP");

  if (!grupo) {
    console.log("Grupo não encontrado!");
    return;
  }

  const mensagem = process.argv[2];

  await client.sendMessage(grupo.id._serialized, mensagem);
  console.log("Mensagem enviada!");
  

});

client.on('message_ack', (msg, ack) => {
    if (ack === 1) {
        client.destroy();
        process.exit(0);
    }
});


client.initialize();