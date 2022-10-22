import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits  } from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ],
});

client.login(process.env.TOKEN);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => 
{
   if(!message?.author.bot && message.author.id !== "490599226200424448" && message.channel.name === "arte-bonito-rioni")
   {
    message.reply("¿Tú te llamas Rioni? No, claro que no, porque te llamas " + message.member.displayName);
   } 
});