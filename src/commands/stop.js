import { SlashCommandBuilder } from '@discordjs/builders';
import pkg from "discord.js"
const { EmbedBuilder } = pkg

export default {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stops the music and clears the queue"),

    execute: async ({ client, interaction }) => {

        // Get the queue for the server
        const queue = client.player.getQueue(interaction.guildId)

        // If there is no queue, return
        if (!queue) {
            await interaction.reply("There are no songs in the queue");
            return;
        }

        // Clear the queue
        queue.destroy()

        // Return an embed to the user saying the song has been skipped
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription("The queue has been cleared!")
            ]
        })
    }
}
