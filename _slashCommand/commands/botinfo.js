import { SlashCommandBuilder } from "discord.js";

import ReadableTime from "../../_modules/ReadableTime/index.js";


export default {
    data: new SlashCommandBuilder()
        .setName("botinfo")
        .setDescription("Show bot details"),
    async execute({ client, interaction, version }) {
        const messageCreateTime = new Date().getTime();

        var content = "";
        switch (Math.floor(Math.random() * 2)) {
            case 0:
                content = "看到這行的人可以獲得一塊餅乾 ฅ ^• ω •^ ฅ";
                break;
            case 1:
                content = "看到這行的人可以獲得一罐雪碧 ฅ ^• ω •^ ฅ";
                break;
        }
        await interaction.reply({
            embeds: [{
                color: parseInt("ffff00", 16),
                title: content,
                footer: {
                    text: `Bot V ${version}`
                },
                timestamp: new Date(),
            }]
        });

        const networkLatency = messageCreateTime - interaction.createdTimestamp;
        const apiLatency = client.ws.ping;
        const latency = networkLatency + apiLatency;

        var emoji;
        var emojiDescription;

        switch (true) {
            case (latency < 300):
                emoji = ":laughing:";
                emojiDescription = "Very good !";
                break;
            case (latency < 1000):
                emoji = ":confused:";
                emojiDescription = "Uh, A bit laggy ...";
                break;
            case (latency < 2000):
                emoji = ":confounded:";
                emojiDescription = "It looks like we have a bad network connection ...";
                break;
            default:
                emoji = ":exploding_head:";
                emojiDescription = "Oh my, it looks terrible !\n***Are you on the moon ?***";
                break;
        }

        await interaction.editReply({
            embeds: [{
                color: parseInt("00FF00", 16),
                title: "Bot info",
                fields: [
                    {
                        name: "API Latency",
                        value: `\`${apiLatency < 0 ? 0 : apiLatency} ms\``,
                        inline: true
                    },
                    {
                        name: "Network Latency",
                        value: `\`${networkLatency < 0 ? 0 : networkLatency} ms\``,
                        inline: true
                    },
                    {
                        name: `Rate ${emoji}`,
                        value: emojiDescription,
                        inline: false
                    },
                    {
                        name: "Uptime",
                        value: `\`${ReadableTime(client.uptime)["string"]}\``,
                        inline: true
                    },
                    {
                        name: "Start time",
                        value: `\`${client.readyAt.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })} (GMT+8)\``,
                        inline: true
                    },
                    {
                        name: "Version",
                        value: `\`V ${version}\``,
                        inline: false
                    }
                ],
                timestamp: new Date(),
            }]
        });
    }
};