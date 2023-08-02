import { schema_chat } from "../_schema.js";


export default async function readChat(chatID) {
    try {
        return await schema_chat.findOne({ chatID: chatID });
    }
    catch (error) {
        throw new Error("An error occurred while reading the chat record");
    }
}