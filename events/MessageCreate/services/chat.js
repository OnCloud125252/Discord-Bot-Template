import requestChat from "../../../_modules/ChatGPT/index.js";
import readChat from "../../../_modules/MongoDB/functions/chat/read.js";
import updateChat from "../../../_modules/MongoDB/functions/chat/update.js";


export default async function chat(message) {
    const previousMessage = await message.reply("ChatGPT is thinking ...");
    try {
        const chatID = message.channel.id;

        const oldMessageObj = await readChat(chatID);

        const messageObj = {
            role: "user",
            name: message.author.id,
            content: message.content
        };

        const title = await (async () => {
            if (oldMessageObj.messages.length === 2) {
                const oldMessages = JSON.parse(JSON.stringify(oldMessageObj.messages));
                oldMessages.push({
                    role: "user",
                    name: message.author.id,
                    content: message.content + "\n\nGenerate a title for our conversation in one sentence. Please reply with only the title. Please do not wrap the title with any kind of brackets or quotes."
                });
                const chatTitle = (await requestChat(oldMessages)).choices[0].message.content;
                await message.channel.setName(chatTitle);
                return chatTitle;
            }
            else {
                return null;
            }
        })();

        oldMessageObj.messages.push(messageObj);
        const gptReply = (await requestChat(oldMessageObj.messages)).choices[0].message;

        await updateChat(chatID, title, [messageObj, gptReply]);

        await previousMessage.edit(gptReply.content);
    } catch (error) {
        console.error(error);
        await previousMessage.edit("Can't connect to ChatGPT, please try again later.");
    }
}
