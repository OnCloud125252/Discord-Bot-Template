import { Client, GatewayIntentBits, Partials, Collection, ActivityType } from "discord.js";
import mongoose from "mongoose";
import express from "express";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

import registerSlashCommands from "./SlashCommands/register.js";
import readableTime from "./_modules/readableTime/index.js";
import InteractionCreateHandler from "./events/InteractionCreate/handler.js";
import MessageCreateHandler from "./events/MessageCreate/handler.js";
import ThreadDeleteHandler from "./events/ThreadDelete/handler.js";
import unRegisterSlashCommands from "./SlashCommands/unRegister.js";
import CheckMissingENV from "./_modules/CheckMissingENV/index.js";

const startTime = performance.now();

dotenv.config();
const missingENV = CheckMissingENV(process);
if (missingENV.required[0]) {
    throw new Error(`Server: required environment variable(s) ${missingENV.required.join(", ")} not found`);
}
if (missingENV.optional[0]){
    console.warn(`Server: optional environment variable(s) ${missingENV.optional.join(", ")} not found, using default value`);
}
const packageJSON = JSON.parse(readFileSync("./package.json"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const server = express();
const host = (process.env.HOST) || "localhost";
const port = (process.env.PORT) || 3000;

await unRegisterSlashCommands();
await registerSlashCommands();

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel]
});

client.commands = new Collection();
const commandsPath = join(__dirname, "/SlashCommands", "/commands");
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const { default: command } = await import(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`registerSlashCommands : the command at ${filePath} is missing a required "data" or "execute" property`);
    }
}

client.on("interactionCreate", async interaction => await InteractionCreateHandler(client, interaction));
client.on("messageCreate", async message => await MessageCreateHandler(message));
client.on("threadDelete", async thread => await ThreadDeleteHandler(thread));

client.on("ready", async () => {
    mongoose.set("strictQuery", false);
    const db = await mongoose.connect((process.env.MONGO_URI), { keepAlive: true });
    console.log(`Server : successfully connected to MongoDB, Database name: "${db.connections[0].name}"`);

    server.set("port", port);
    server.set("host", host);
    const app = server.listen(server.get("port"), server.get("host"), () => {
        const finishTime = performance.now();
        console.error(`Keepalive : listening on ${host}:${app.address().port}`);
        console.log(`Bot : logged in as ${client.user.tag}`);
        console.log(`Server : client is on (took ${readableTime(Math.round(finishTime - startTime))["string"]})`);
    });
    server.get("/", (_, res) => {
        res.status(200).json(`Service is up : ${readableTime(Math.round(performance.now()))["string"]}`);
    });

    (function loop() {
        client.user?.setPresence({
            status: "online",  // online, idle, dnd, invisible

            activities: [{
                name: `/help | ${client.ws.ping}ms | Serving in ${client.guilds.cache.size} servers | V${packageJSON.version}`,
                type: ActivityType.Listening
            }],
        });
        setTimeout(() => {
            loop();
        }, 10 * 1000);
    })();
});

client.login(process.env.BOT_TOKEN);