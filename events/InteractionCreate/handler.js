import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { readFileSync } from "fs";

import uuid from "../../_modules/uuid/index.js";
import logErrorToDB from "../../_modules/MongoDB/functions/log/write.js";


const packageJSON = JSON.parse(readFileSync("./package.json"));

export default async function InteractionCreateHandler(client, interaction) {
    const errorUUID = uuid();

    process.on("uncaughtException", async (error) => {
        console.error(error);
        await logErrorToDB(errorUUID, {
            interaction,
            error,
            command: {
                name: interaction.commandName,
                subcommand: interaction.options._subcommand,
                options: interaction.options._hoistedOptions.map(option => { return { name: option.name, value: option.value }; })
            }
        });
    });

    try {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Slash command : no command matching ${interaction.commandName} was found`);
            return;
        }

        await command.execute({ client, interaction, version: packageJSON.version });
    } catch (error) {
        console.error(error);
        await logErrorToDB(errorUUID, {
            interaction,
            error,
            command: {
                name: interaction.commandName,
                subcommand: interaction.options._subcommand,
                options: interaction.options._hoistedOptions.map(option => { return { name: option.name, value: option.value }; })
            }
        });

        const contactRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Report error to admin")
                    .setURL(`https://discord.com/users/${process.env.ADMIN_USER_ID}`)
                    .setStyle(ButtonStyle.Link)
            );
        await interaction.channel.send({
            embeds: [{
                color: parseInt("ff0000", 16),
                title: "Error occurred",
                description: "Please copy and paste the following information to admin :",
                fields: [
                    {
                        name: "1. Error ID",
                        value: `\`${errorUUID}\``,
                        inline: false
                    },
                    {
                        name: "2. The screenshot of the command(s)",
                        value: "(insert the screenshot)",
                        inline: false
                    },
                ],
                footer: {
                    text: `Bot V ${packageJSON.version}`
                },
                timestamp: new Date(),
            }],
            components: [contactRow]
        });
    }
}