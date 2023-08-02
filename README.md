# Discord Bot Template

## Introduction
The Discord Bot Template is a powerful starting point for creating a feature-rich Discord bot, utilizing modern slash commands.  

Building commands for this bot is developer-friendly, as you only need to create a file in `SlashCommands/commands`, and the built-in script will take care of the rest.

**Features included in this template:**
- **ChatGPT**: This bot comes with a ChatGPT feature that can read chat history and remember users' Discord names, enhancing the interaction experience.
- **Music Player**: Enjoy music playback with the built-in music player, providing entertainment to users in your Discord server.
- **Tic Tac Toe**: A fun and classic game of Tic Tac Toe is included, adding a playful element to your bot.
- **Auto-generated Help Command**: Help users navigate your bot's commands effortlessly with the auto-generated help command.
- **Error Logging**: Keep track of any unexpected errors efficiently with the integrated error logging feature.

Start building your Discord bot with these powerful features using the Discord Bot Template!

## Requirements
- **Node.js** (version 16 or higher)
- **pnpm**  
    Note: pnpm is the recommended package manager, but npm can still be used.  
    You can install pnpm using `npm install -g pnpm`. For more installation option please visit [pnpm document](https://pnpm.io/installation).

## Installation
1. Clone this repository
    ```bash
    git clone https://github.com/OnCloud125252/Discord-Bot-Template.git
    ```
2. Install dependencies
    ```bash
    pnpm install
    ```
    If you prefer to use `npm`, you can run `npm install` instead.
3. Set up `.env` file
    - Rename `.env-example` file in the project folder into `.env`.
    - Configure the following variables in `.env`:
        - **BOT_TOKEN**
        - **CLIENT_ID**
        - **MONGO_URI**
        - **OPEN_AI_KEY**
        - **ADMIN_USER_ID**
        - **HOST (Optional)**
        - **PORT (Optional)**
4. Configuring variables in `.env`  
    - Get your `BOT_TOKEN` by creating an application on [Discord Developer Portal](https://discord.com/developers/applications). Navigate to "OAuth2" => "General" on your application page to get the `CLIENT_ID`.  
    - Set up a MongoDB database with "chats", "guilds", and "logs" collections, and paste the connection URI into `MONGO_URI`.  
    - Obtain your `OPEN_AI_KEY` on the account section of [OpenAI API Platform](https://platform.openai.com/account/api-keys).  
    - The `ADMIN_USER_ID` should be the Discord user ID of the person who will handle error reports. Link their profile to the "Report error to admin" button in the bot.  
    ![image](https://github.com/OnCloud125252/Discordbot-Template/assets/75195127/bb20be48-5000-4383-a465-0164915c0052)

## Invite your bot
You can create an invite link for your bot by following these steps:  
1. Go to "OAuth2" => "URL Generator" on your [Discord Developer Portal](https://discord.com/developers/applications) application page.
2. Select "bot" for scopes and "Administrator" for bot permissions.
3. A link will be generated, it will look something like this: `https://discord.com/api/oauth2/authorize?client_id=0000000000000000000&permissions=8&scope=bot`.
4. Click on the link to invite your bot into your servers!