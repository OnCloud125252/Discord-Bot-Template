import { schema_guild } from "../_schema.js";


export default async function updateGuild(guildID, data) {
    switch (true) {
        case (data === null):
            break;

        case (!Array.isArray(data)):
            throw new Error("Data is not array");

        case (data.length === 0):
            throw new Error("Data is empty");
    }
    try {
        let updatedData = null;

        const existingGuild = await schema_guild.findOne({ guildID: guildID });

        if (existingGuild) {
            data.forEach(({ key, editor }) => {
                existingGuild[key] = editor(existingGuild[key] ?? null);
            });

            updatedData = existingGuild;

            await existingGuild.save();
        }
        else {
            const newGuild = new schema_guild({
                guildID: guildID
            });

            data.forEach(({ key, editor }) => {
                newGuild[key] = editor(newGuild[key] ?? null);
            });

            updatedData = newGuild;

            await newGuild.save();
        }

        return updatedData;
    }
    catch (error) {
        throw new Error("An error occurred while updating or creating the chat record");
    }
}