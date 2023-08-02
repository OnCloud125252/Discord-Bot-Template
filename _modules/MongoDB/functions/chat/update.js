import { schema_chat } from "../_schema.js";


export default async function updateChat(chatID, title, message) {
    try {
        let chatToUpdate = null;

        const existingChat = await schema_chat.findOne({ chatID: chatID });

        if (existingChat) {
            if (title) {
                existingChat.title = title;
            }
            existingChat.messages.push(...message);
            existingChat.updateTime = new Date();

            chatToUpdate = existingChat;

            await existingChat.save();
        }
        else {
            const newChat = new schema_chat({
                chatID: chatID,
                title: "New Chat",
                messages: [...message],
                createTime: new Date(),
                updateTime: new Date(),
            });

            chatToUpdate = newChat;

            await newChat.save();
        }

        return chatToUpdate;
    }
    catch (error) {
        throw new Error("An error occurred while updating or creating the chat record");
    }
}