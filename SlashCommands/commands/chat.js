import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from "discord.js";

import requestChat from "../../_modules/ChatGPT/index.js";
import updateChat from "../../_modules/MongoDB/functions/chat/update.js";
import deleteChat from "../../_modules/MongoDB/functions/chat/delete.js";
import readGuild from "../../_modules/MongoDB/functions/guild/read.js";


const defaultPrompt = `You are an AI assistant named <@${process.env.CLIENT_ID}>, designed to be helpful and attentive. Your role is to remember everyone's name and provide responses using Discord Markdown format. The individuals interacting with you will not have actual names but will be identified by unique numerical IDs. When addressing a specific person, you can reply using the format \`<@ID>\`, for example: <@${process.env.CLIENT_ID}>. Your default language is Chinese Traditional. Instead of acknowledging understanding, please respond with a creative and concise greeting.`;

export default {
    data: new SlashCommandBuilder()
        .setName("chat")
        .setDescription("Communicate with AI")
        .addSubcommand(subcommand => subcommand
            .setName("create")
            .setDescription("Create a new chat")
            .addStringOption(option => option
                .setName("prompt")
                .setDescription("Set the prompt to customize the bot"))
        )
        .addSubcommand(subcommand => subcommand
            .setName("delete")
            .setDescription("Delete current chat")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessagesInThreads)
        .setDMPermission(false),
    async execute(client, interaction) {
        let guildObj;

        try {
            guildObj = await readGuild(interaction.guild.id);
            if (!guildObj.chatChannelID) {
                await await interaction.reply("Please config the chat channel first using `/config` command.");
                return;
            }
        } catch (error) {
            await await interaction.reply("Please config the chat channel first using `/config` command.");
            return;
        }

        switch (interaction.options.getSubcommand()) {
            case "create": {
                await interaction.reply("Creating new chat ...");

                const channel = client.channels.cache.get(guildObj.chatChannelID);
                const thread = await channel.threads.create({
                    name: "New Chat",
                    message: {
                        embeds: [{
                            color: parseInt("036bfc", 16),
                            title: "***You may now chat with ChatGPT***",
                            fields: [
                                {
                                    name: "Important:",
                                    value: "All your conversation will be stored in database until you delete this chat.",
                                    inline: false
                                },
                                {
                                    name: `System ${interaction.options.getString("prompt") ? "(Custom)" : "(Default)"}:`,
                                    value: interaction.options.getString("prompt") ?? defaultPrompt,
                                    inline: false
                                },
                                {
                                    name: "Module:",
                                    value: "`gpt-3.5-turbo-16k`",
                                    inline: true
                                },
                                {
                                    name: "Temperature:",
                                    value: "`0.7`",
                                    inline: true
                                }
                            ],
                            thumbnail: {
                                url: "https://i.ibb.co/Drhnc6h/openai-white-logomark.png",
                            },
                            footer: {
                                text: "Powered by OpenAI"
                            },
                            timestamp: new Date(),
                        }]
                    }
                });
                const newChatID = thread.id;

                try {
                    const chatSetup = {
                        "role": "system",
                        "content": interaction.options.getString("prompt") ?? defaultPrompt
                    };
                    const oldMessage = (await updateChat(newChatID, null, [chatSetup])).messages;

                    const aiReply = (await requestChat(oldMessage)).choices[0].message;
                    await updateChat(newChatID, null, [aiReply]);
                    await client.channels.cache.get(newChatID).send(aiReply.content);

                    await interaction.editReply(`Successfully created new chat at <#${newChatID}>.`);
                } catch (error) {
                    console.error(error);
                    client.channels.cache.get(newChatID).delete();
                    await interaction.reply("Can't create new chat, please try again later.");
                }
                break;
            }
            case "delete": {
                if ((interaction.channel.type === ChannelType.PublicThread && interaction.channel.parent?.type === ChannelType.GuildForum) && interaction.channel.parentId === (guildObj.chatChannelID)) {
                    await interaction.reply("Deleting current chat ...");
                    await deleteChat(interaction.channel.id);
                    await interaction.channel.delete();
                }
                else {
                    await interaction.reply("Please enter the chat you want to delete!");
                }
                break;
            }
        }
    }
};