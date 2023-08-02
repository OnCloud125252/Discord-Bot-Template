import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith(".js"));
const commandList = commandFiles.map(commandName => {
    commandName = commandName.substring(0, commandName.length - 3);
    return { name: commandName, value: commandName };
});

export default {
    data: new SlashCommandBuilder()
        .setName("help")
        .addStringOption(option =>
            option
                .setName("command")
                .setDescription("Show details of command")
                .addChoices(...commandList)
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option
                .setName("visible")
                .setDescription("Response message visibility, default is false")
                .setRequired(false)
        )
        .setDescription("Lists all available slash commands"),
    async execute(client, interaction, version) {
        const selectedCommand = interaction.options.getString("command") ?? false;
        const responseMessageVisibility = !(interaction.options.getBoolean("visible") ?? false);

        await interaction.deferReply({ ephemeral: responseMessageVisibility });
        if (selectedCommand) {
            const { default: command } = await import(`./${selectedCommand}.js`);
            const options = command.data.options.map(cmd => {
                return {
                    name: `\`${cmd.name}\` (***${cmd.required ? "required" : "optional"}***)`,
                    value: cmd.description,
                    inline: false
                };
            });
            if (options[0]) {
                options.unshift({
                    name: "\u200B",
                    value: "**Options :**"
                });
            }

            await interaction.editReply({
                embeds: [{
                    color: parseInt("ba03fc", 16),
                    title: `Command :\n\`/${command.data.name}\``,
                    description: command.data.description,
                    fields: options,
                    footer: {
                        text: `Bot V ${version}`
                    },
                    timestamp: new Date(),
                }],
                ephemeral: responseMessageVisibility
            });
        }
        else {
            var commandList = [];

            for (const file of commandFiles) {
                const { default: command } = await import(`./${file}`);
                commandList.push({
                    name: command.data.name,
                    value: command.data.description
                });
            }

            await interaction.editReply({
                embeds: [{
                    color: parseInt("ba03fc", 16),
                    title: "Available slash commands",
                    fields: commandList,
                    footer: {
                        text: `Bot V ${version}`
                    },
                    timestamp: new Date(),
                }],
                ephemeral: responseMessageVisibility
            });
        }
    }
};