const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('✅ Bot está online!');

  const numero = '5511940005063@c.us'; // @c.us pra contato pessoal g.us pra grupo
  const mensagem = '🖕';

  for(let i = 0; i<10; i++){
  await client.sendMessage(numero, mensagem);
  }

  console.log(`📤 Mensagem enviada para ${numero}`);
});

client.initialize();