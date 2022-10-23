import dotenv from 'dotenv';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { Player } from 'discord-player';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// import * as server from './keep_alive.js'

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ],
});

// Load all the commands
const commands = [];
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = pathToFileURL(path.join(commandsPath, file)).href;
    const command = await import(filePath);
    console.log("COMMAND: ", command.default.data.name);

    client.commands.set(command.default.data.name, command);
    commands.push(command.default.data.toJSON());
    //commands.push(JSON.stringify(command));
}

client.player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
    },
});

client.login(process.env.DISCORD_TOKEN);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const guild_ids = client.guilds.cache.map(guild => guild.id);
    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
    for (const guildId of guild_ids) {
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
            { body: commands })
            .then(() => console.log(`Added commands to ${guildId}`))
            .catch(console.error);
    }
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

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.default.execute({ client, interaction });
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});