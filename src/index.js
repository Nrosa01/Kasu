import dotenv from 'dotenv';
// import * as server from './keep_alive.js'
dotenv.config();

import { Client, GatewayIntentBits } from 'discord.js';

import {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	entersState,
	StreamType,
	AudioPlayerStatus,
	VoiceConnectionStatus,
} from '@discordjs/voice';

const player = createAudioPlayer();

// import { getVoiceConnection } from '@discordjs/voice';

// const connection = getVoiceConnection(message.guild.id);

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
    processIfNotRioni(message);
    processIfAmogus(message);
});

async function processIfNotRioni(message)
{
    if (!message?.author.bot && message.author.id === "490599226200424448" && message.channel.name === "arte-bonito-rioni")
    {
      message.react("👎")
  
      if (message.member.displayName.toLowerCase().includes("rioni"))
          message.reply("A ver, no te pongas Rioni en el nombre porque no eres Rioni, listo, que eres muy listo. Sé que tu verdadero nombre es " + message.author.username)
      else
        message.reply("¿Tú te llamas Rioni? No, claro que no, porque te llamas " + message.member.displayName);
    }
}

async function processIfAmogus(message)
{
    if (message?.author.bot) return;
    
    if (message.content === '!amogus') {
        console.log("Amogus");
        const channel = message.member?.voice.channel;

        if (channel) {
            try {
				const connection = await connectToChannel(channel);
				//connection.subscribe(player);
                playSong("https://www.youtube.com/watch?v=5DlROhT8NgU");
				message.reply('Playing now!');
			} catch (error) {
				console.error(error);
			}
        }
        else {
            message.reply("No estás en un canal de voz :/");
        }
    }

    console.log(message.content);
}

function createConnection(channel) {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    return connection;
}

async function connectToChannel(channel) {
	const connection = createConnection(channel)

	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
}

function playSong(url) {
	const resource = createAudioResource(url, {
		inputType: StreamType.Arbitrary,
	});

	player.play(resource);

	return entersState(player, AudioPlayerStatus.Playing, 5e3);
}