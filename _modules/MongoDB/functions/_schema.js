import mongoose from "mongoose";


const Schema = mongoose.Schema;

const chat = new Schema({
    chatID: String,
    title: String,
    messages: Array,
    createTime: Date,
    updateTime: Date
});
export const schema_chat = mongoose.model("chat", chat, "chats");

const guild = new Schema({
    guildID: String,
    chatChannelID: String
});
export const schema_guild = mongoose.model("guild", guild, "guilds");

const log = new Schema({
    id: String,
    guild: {
        name: String,
        id: String
    },
    channel: {
        name: String,
        id: String
    },
    command: {
        name: String,
        subcommand: String,
        options: String
    },
    fullError: String,
    timestamp: Date
});
export const schema_log = mongoose.model("log", log, "logs");