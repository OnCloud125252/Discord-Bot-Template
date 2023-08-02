import { schema_log } from "../_schema.js";


export default async function logErrorToDB(errorUUID, errorObject) {
    const { interaction, error, command } = errorObject;

    const newLog = new schema_log({
        id: errorUUID,
        guild: {
            name: String(interaction.guild.name),
            id: String(interaction.guildId)
        },
        channel: {
            name: String(interaction.channel.name),
            id: String(interaction.channelId)
        },
        command: {
            name: String(command.name),
            subcommand: command.subcommand ? String(command.subcommand) : null,
            options: command.options[0] ? command.options.map(option => JSON.stringify(option, null, 4)).join(",\n") : null
        },
        fullError: error,
        timestamp: new Date(),
    });

    await newLog.save();

    console.log(`logErrorToDB : successfully logged error to database, error: ${errorUUID}`);
}