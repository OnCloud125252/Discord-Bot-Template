import { schema_guild } from "../_schema.js";


export default async function readGuild(guildID) {
    try {
        return await schema_guild.findOne({ guildID: guildID });
    }
    catch (error) {
        throw new Error("An error occurred while reading guild data");
    }
}