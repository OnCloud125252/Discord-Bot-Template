import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from "discord.js";

import updateGuild from "../../_modules/MongoDB/functions/guild/update.js";


export default {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("Config this bot for your server")
        .addSubcommand(subcommand => subcommand
            .setName("chat")
            .setDescription("Config ChatBot")
            .addChannelOption(option => option
                .setName("channel")
                .setDescription("Channel(Forum) to chat with ChatGPT")
                .addChannelTypes(ChannelType.GuildForum)
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName("reset")
            .setDescription("Reset all config")
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(client, interaction) {
        switch (interaction.options.getSubcommand()) {
            case "chat": {
                const channelObj = interaction.options.getChannel("channel");
                try {
                    await updateGuild(channelObj.guildId, [
                        {
                            key: "chatChannelID",
                            editor: () => channelObj.id
                        }
                    ]);
                    await interaction.reply(`Successfully register <#${channelObj.id}> for ChatBot in this server.`);
                } catch (error) {
                    await interaction.reply("Can't config chat channel, please try again later.");
                }
                break;
            }
        }
    }
};