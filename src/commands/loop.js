import { SlashCommandBuilder } from '@discordjs/builders';
import pkg from "discord.js"
const { EmbedBuilder } = pkg

export default {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Loops the current song")
        .addSubcommand(subcommand =>
            subcommand
                .setName("track")
                .setDescription("Loops the current song")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("queue")
                .setDescription("Loops the entire queue")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("off")
                .setDescription("Turns off looping")
        ),

    execute: async ({ client, interaction }) => {
        // Get the queue for the server
        const queue = client.player.getQueue(interaction.guildId)

        // Check if the queue is empty
        if (!queue)
        {
            await interaction.reply("There are no songs in the queue");
            return;
        }

        // Get the subcommand
        const subcommand = interaction.options.getSubcommand()

        // Check which subcommand was used
        switch (subcommand)
        {
            case "track":
                // Set the mode to track
                queue.setRepeatMode(1);
                await interaction.reply("Looping the current song");
                break;
            case "queue":
                // Set the mode to queue
                queue.setRepeatMode(2);
                await interaction.reply("Looping the entire queue");
                break;
            case "off":
                // Set the mode to off
                queue.setRepeatMode(0);
                await interaction.reply("Looping has been turned off");
                break;
        }
    },
}