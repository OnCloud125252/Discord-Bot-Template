import { SlashCommandBuilder, ChannelType } from "discord.js";
import MusicPlayer from "../../_modules/MusicPlayer/index.js";
import searchMusic from "../../_modules/MusicPlayer/searchMusic/music.js";


const player = new MusicPlayer();

export default {
    data: new SlashCommandBuilder()
        .setName("music")
        .addSubcommand(subcommand => subcommand
            .setName("play")
            .setDescription("Play or search for a music")
            .addStringOption(option =>
                option
                    .setName("music")
                    .setDescription("Search for a music or provide the URL of a music (Only support YouTube)")
                    .setRequired(true)
            )
            .addChannelOption(option =>
                option
                    .setName("channel")
                    .setDescription("Provide a channel to play music")
                    .addChannelTypes(ChannelType.GuildVoice)
                    .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName("skip")
            .setDescription("Skip current music")
        )
        .addSubcommand(subcommand => subcommand
            .setName("pause")
            .setDescription("Pause current music")
        )
        .addSubcommand(subcommand => subcommand
            .setName("resume")
            .setDescription("Resume paused music")
        )
        .addSubcommand(subcommand => subcommand
            .setName("list")
            .setDescription("List all queued music")
        )
        // .addSubcommand(subcommand => subcommand
        //     .setName("delete")
        //     .setDescription("Delete a music in queue")
        //     .addIntegerOption(option =>
        //         option
        //             .setName("id")
        //             .setDescription("Provide the ID of the music to delete")
        //             .setRequired(true)
        //     )
        // )
        .setDescription("Use a music player"),

    async execute(client, interaction) {
        switch (interaction.options.getSubcommand()) {
            case "play": {
                const music = interaction.options.getString("music");
                const voiceChannel = interaction.options.getChannel("channel");

                if (/^(https?:\/\/)?(www\.)?(youtu\.be)\/watch\?v=([a-zA-Z0-9_-]{11})/.test(music) || /^(https?:\/\/)?(www|m|music)\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/.test(music)) {
                    player.play(interaction, music, voiceChannel.id);
                }
                else {
                    try {
                        const musicID = await searchMusic(music);
                        player.play(interaction, `https://www.youtube.com/watch?v=${musicID}`, voiceChannel.id);
                    } catch (error) {
                        console.log(error);
                        interaction.reply("Music not found");
                    }
                }
                break;
            }

            case "skip": {
                player.playNextMusic(interaction);
                break;
            }

            case "pause": {
                player.pause(interaction);
                break;
            }

            case "resume": {
                player.resume(interaction);
                break;
            }

            case "list": {
                player.nowQueue(interaction);
                break;
            }

            // case "delete": {
            //     const musicID = interaction.options.getInteger("id");
            //     player.deletePlayList(interaction, musicID);
            //     break;
            // }

            default: {
                // Show graphic player
                break;
            }
        }
    }
};