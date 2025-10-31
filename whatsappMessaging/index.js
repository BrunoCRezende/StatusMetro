const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', async () => {
    console.log(`Logado como ${client.user.tag}!`);

    const channelName = "geral";
    const mensagem = process.argv[2];

    let channelFound = null;
    client.guilds.cache.forEach(guild => {
        if (channelFound) return; 
        const channel = guild.channels.cache.find(c => c.name === channelName && c.isTextBased());
        if (channel) channelFound = channel;
    });

    if (!channelFound) return console.error(`canal não encontrado`);

    channelFound.send(mensagem)
        .then(() => console.log(`Mensagem enviada`))
        .catch(console.error);
});

  setTimeout(() => {
    console.warn("Timeout");
    client.destroy();
    process.exit(0);
  }, 15000);

client.login(process.env.DISCORD_BOT_TOKEN);
