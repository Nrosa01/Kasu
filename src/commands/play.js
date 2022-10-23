import { SlashCommandBuilder } from "@discordjs/builders"
import pkg from "discord.js"
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = pkg
import { QueryType } from "discord-player"

export default {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("play a song from YouTube.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("search")
                .setDescription("Searches for a song and plays it")
                .addStringOption(option =>
                    option.setName("searchterms").setDescription("search keywords").setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("playlist")
                .setDescription("Plays a playlist from YT")
                .addStringOption(option => option.setName("url").setDescription("the playlist's url").setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("song")
                .setDescription("Plays a single song from YT")
                .addStringOption(option => option.setName("url").setDescription("the song's url").setRequired(true))
        ),
    execute: async ({ client, interaction }) => {
        // Make sure the user is inside a voice channel
        if (!interaction.member.voice.channel) return interaction.reply("You need to be in a Voice Channel to play a song.");

        // Create a play queue for the server
        const queue = await client.player.createQueue(interaction.guild);

        // Wait until you are connected to the channel
        if (!queue.connection) await queue.connect(interaction.member.voice.channel)

        let embed = new EmbedBuilder()

        if (interaction.options.getSubcommand() === "song") {
            let url = interaction.options.getString("url")

            // Search for the song using the discord-player
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            })

            // finish if no tracks were found
            if (result.tracks.length === 0)
                return interaction.reply("No results")

            // Add the track to the queue
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}` })

        }
        else if (interaction.options.getSubcommand() === "playlist") {

            // Search for the playlist using the discord-player
            let url = interaction.options.getString("url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            })

            if (result.tracks.length === 0)
                return interaction.reply(`No playlists found with ${url}`)

            // Add the tracks to the queue
            const playlist = result.playlist
            await queue.addTracks(result.tracks)
            embed
                .setDescription(`**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** have been added to the Queue`)
                .setThumbnail(playlist.thumbnail)

        }
        else if (interaction.options.getSubcommand() === "search") {

            // Search for the song using the discord-player
            let url = interaction.options.getString("searchterms")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })

            // finish if no tracks were found
            if (result.tracks.length === 0)

                return interaction.editReply("No results")

            // Loop through the results and add them to the embed
            var maxResults = 5

            let i = 0
            for (const track of result.tracks) {
                if (i >= maxResults) break
                embed.addFields({ name: `${i+1}. ${track.title}`, value: `Duration: ${track.duration}` })
                i++
            }

            // Build row of buttons using loop
            let row = new ActionRowBuilder()
            for (let i = 0; i < maxResults; i++) {
                row.addComponents(new ButtonBuilder()
                    .setLabel(`${i + 1}`)
                    .setStyle("Primary")
                    .setCustomId(`play${i + 1}`)
                )
            }

            await interaction.reply({ embeds: [embed], components: [row] })

            // Create a collector for the buttons using promisified awaitMessageComponent
            const filter = (button) => button.user.id === interaction.user.id
            const collector = await interaction.channel.awaitMessageComponent({ filter, time: 15000 })

            // Tell messageComponent that we are done with it
            collector.deferUpdate()

            // Get the button that was clicked
            const button = collector.customId

            // Get the index of the button
            const index = button.replace("play", "") - 1

            // Add the track to the queue
            const song = result.tracks[index]
            await queue.addTrack(song)

            // Clear embed
            embed = new EmbedBuilder()

            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}` })
        }


        // Play the song
        if (!queue.playing) await queue.play()

        // Respond with the embed containing information about the player
        try
        {

            await interaction.reply({
                embeds: [embed]
            })
        }
        catch (e)
        {
            await interaction.followUp({
                embeds: [embed]
            })
        }
    },
};