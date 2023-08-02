import { schema_chat } from "../_schema.js";

export default async function deleteChat(chatID) {
    try {
        return await schema_chat.findOneAndDelete({ chatID: chatID });
    } catch (error) {
        throw new Error("An error occurred while deleting the chat record");
    }
}