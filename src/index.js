import dotenv from 'dotenv';
import * as server from './keep_alive.js'
import { DisTube } from 'distube'

dotenv.config();

client.DisTube = new DisTube(client, 
    { 
      searchSongs: false,
      emitNewSongOnly: true, 
      leaveOnFinish: true, 
      leaveOnStop: false, 
      youtubeDL: true, 
      updateYouTubeDL: true,
      emitAddSongWhenCreatingQueue: false,
      emitAddListWhenCreatingQueue: false,
    })

import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
});

client.login(process.env.TOKEN);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (!message?.author.bot && message.author.id !== "490599226200424448" && message.channel.name === "arte-bonito-rioni") {
    message.react("👎")

    if (message.member.displayName.toLowerCase().includes("rioni"))
      message.reply("A ver, no te pongas Rioni en el nombre porque no eres Rioni, listo, que eres muy listo. Sé que tu verdadero nombre es " + message.author.username)
    else
      message.reply("¿Tú te llamas Rioni? No, claro que no, porque te llamas " + message.member.displayName);
  }
});

client.on('messageCreate', async (message) =>
{
    if (message?.author.bot || !message.guild) return;
    const prefix = "?";
    
    if (message.content.startsWith(prefix)) {
        console.log("Amogus");
        const channel = message.member?.voice.channel;

        if(args.shift() === "play") {
            client.DisTube.play(channel, args.join(" "),
            {
                member: message.member,
                textChannel: message.channel,
                message
            });
        }
    }
    else

    console.log(message.content);
});

client.DisTube.on("playSong", (queue, song) => queue.textChannel.send(
    `Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user}`
));