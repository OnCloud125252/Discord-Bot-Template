import { REST, Routes } from "discord.js";
import * as dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

const BOT_TOKEN = (process.env.BOT_TOKEN);
const CLIENT_ID = (process.env.CLIENT_ID);


const commands = [];
const commandFiles = fs.readdirSync(join(__dirname, "/commands")).filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const { default: command } = await import(`./commands/${file}`);
    if (!command) break;
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

export default async function registerSlashCommands() {
    try {
        console.log("registerSlashCommands : started refreshing slash commands");

        if (commands[0]) {
            await rest.put(
                Routes.applicationCommands(CLIENT_ID.toString()),
                {
                    body: commands
                }
            );
            console.log(`registerSlashCommands : successfully reloaded ${commands.length} global slash commands`);
        }
    } catch (error) {
        console.error(error);
    }
}