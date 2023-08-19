import { ChannelType } from "discord.js";

import chat from "./services/chat.js";
import readGuild from "../../_modules/MongoDB/functions/guild/read.js";


export default async function MessageCreateHandler(message) {
    if (message.author.bot) return;

    let guildObj;

    try {
        guildObj = await readGuild(message.guild.id);
    } catch (error) {
        return;
    }

    switch (true) {
        case ((message.channel.type === ChannelType.PublicThread && message.channel.parent?.type === ChannelType.GuildForum) && message.channel.parentId === (guildObj.chatChannelID)): {
            chat(message);
            break;
        }

        default: {
            break;
        }
    }
}