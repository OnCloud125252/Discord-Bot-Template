import { REST, Routes } from "discord.js";


const BOT_TOKEN = (process.env.BOT_TOKEN);
const CLIENT_ID = (process.env.CLIENT_ID);

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

export default async function unRegisterSlashCommands() {
    try {
        console.log("unRegisterSlashCommands : started refreshing slash commands");

        await rest.put(
            Routes.applicationCommands(CLIENT_ID.toString()),
            {
                body: []
            }
        );
        console.log("unRegisterSlashCommands : successfully deleted all global slash commands");
    }
    catch (error) {
        console.error(error);
    }
}