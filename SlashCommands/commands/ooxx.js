import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";


export default {
    data: new SlashCommandBuilder()
        .setName("ooxx")
        .setDescription("Invite a user to play tic tac toe")
        .addUserOption((option) =>
            option.setName("player").setDescription("Invite someone to play").setRequired(true),
        ),
    async execute({ interaction }) {
        const user1 = interaction.user;
        const user2 = interaction.options.getUser("player");
        let gameBoard = new Array(9);
        let count = 0;
        let user = [user1, user2];

        const collector = interaction.channel.createMessageComponentCollector({ time: 150000 });
        let reply = startGame(user1, user2);
        await interaction.reply(reply);
        let phase = 0; // 開始為0 直接結束為-1 運行為1 玩家一勝利為2 玩家二勝利為3 平手為4

        collector.on("collect", (collected) => {
            if (![user1.id, user2.id].includes(collected.user.id)) {
                const embed = new EmbedBuilder()
                    .setTitle("Warning")
                    .setDescription("Why press this button for no reason?");
                collected.reply({ embeds: [embed], ephemeral: true });
                phase = 0;
            }
            else if (collected.customId !== "cancel" && !["0", "1", "2", "3", "4", "5", "6", "7", "8"].includes(collected.customId) && user1.id !== user2.id && collected.user.id === user1.id) {
                const embed = new EmbedBuilder()
                    .setTitle("Warning")
                    .setDescription("Please don't force others to join");
                collected.reply({ embeds: [embed], ephemeral: true });
                phase = 0;
            }
            else {
                switch (collected.customId) {
                    case "yes": {
                        if (collected.user.id === user2.id) {
                            reply = setGame(gameBoard, user);
                            collected.update(reply);
                            phase = 1;
                        }
                        break;
                    }

                    case "no": {
                        if (collected.user == user2) {
                            reply = sendRefuse();
                            collected.update(reply);
                            phase = -1;
                        }
                        break;
                    }

                    case "cancel": {
                        const embed = new EmbedBuilder()
                            .setTitle("The duel is canceled")
                            .setDescription("The game has been canceled");
                        const yesButton = new ButtonBuilder()
                            .setEmoji("⭕")
                            .setStyle(ButtonStyle.Primary)
                            .setCustomId("yes")
                            .setDisabled(true);
                        const noButton = new ButtonBuilder()
                            .setEmoji("❌")
                            .setStyle(ButtonStyle.Primary)
                            .setCustomId("no")
                            .setDisabled(true);
                        const row = new ActionRowBuilder().addComponents(noButton, yesButton);
                        reply = { embeds: [embed], components: [row] };
                        collected.update(reply);
                        collector.stop();
                        break;
                    }

                    default: {
                        if (collected.user.id == user[count % 2].id) {
                            count++;
                            reply = runGame(collected.customId, count, gameBoard, user);
                            phase = checkGame(gameBoard);
                            if (phase != 1) {
                                reply = getResult(phase, gameBoard, user);
                            }
                            collected.update(reply);
                        } else if (collected.user.id == user[(count + 1) % 2].id) {
                            const embed = new EmbedBuilder()
                                .setTitle("Warning")
                                .setDescription("You need to wait for the other side to finish their move");
                            collected.reply({ embeds: [embed], ephemeral: true });
                        } else {
                            const embed = new EmbedBuilder()
                                .setTitle("Warning")
                                .setDescription("It's not your turn");
                            collected.reply({ embeds: [embed], ephemeral: true });
                        }
                        break;
                    }
                }

                if (phase > 1 && phase < 5) {
                    collector.stop();
                } else if (phase != 1) {
                    collector.stop();
                }
            }
        });
        if (phase != 0 || phase != 1) {
            return;
        }
    },
};

function getResult(phase, gameBoard, user) {
    let embed;
    if (phase == 4) {
        embed = new EmbedBuilder().setTitle("Game over").setDescription("Tie");
    } else {
        embed = new EmbedBuilder()
            .setTitle("Game over")
            .setDescription(`Winner: <@${user[(phase - 1) % 2].id}>`);
    }
    let components = new Array(3);
    for (let i = 0; i < 3; i++) {
        let row;
        let buttons = new Array(3);
        for (let j = 0; j < 3; j++) {
            const number = i * 3 + j;
            let button;

            if (gameBoard[number] == 0) {
                button = new ButtonBuilder()
                    .setEmoji("⭕")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`${number}`)
                    .setDisabled(true);
            } else if (gameBoard[number] == 1) {
                button = new ButtonBuilder()
                    .setEmoji("❌")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`${number}`)
                    .setDisabled(true);
            } else {
                button = new ButtonBuilder()
                    .setEmoji("❓")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`${number}`)
                    .setDisabled(true);
            }
            buttons[j] = button;
        }
        row = new ActionRowBuilder().addComponents(buttons);
        components[i] = row;
    }

    return { embeds: [embed], components: components };
}

function checkGame(gameBoard) {
    let phase = 1;

    if (gameBoard[0] == gameBoard[1] && gameBoard[1] == gameBoard[2] && gameBoard[0] != undefined) {
        phase = 2 + gameBoard[0];
    } else if (
        gameBoard[3] == gameBoard[4] &&
        gameBoard[4] == gameBoard[5] &&
        gameBoard[3] != undefined
    ) {
        phase = 2 + gameBoard[3];
    } else if (
        gameBoard[6] == gameBoard[7] &&
        gameBoard[7] == gameBoard[8] &&
        gameBoard[6] != undefined
    ) {
        phase = 2 + gameBoard[6];
    } else if (
        gameBoard[0] == gameBoard[4] &&
        gameBoard[4] == gameBoard[8] &&
        gameBoard[4] != undefined
    ) {
        phase = 2 + gameBoard[4];
    } else if (
        gameBoard[0] == gameBoard[3] &&
        gameBoard[3] == gameBoard[6] &&
        gameBoard[3] != undefined
    ) {
        phase = 2 + gameBoard[3];
    } else if (
        gameBoard[1] == gameBoard[4] &&
        gameBoard[4] == gameBoard[7] &&
        gameBoard[1] != undefined
    ) {
        phase = 2 + gameBoard[4];
    } else if (
        gameBoard[2] == gameBoard[5] &&
        gameBoard[5] == gameBoard[8] &&
        gameBoard[2] != undefined
    ) {
        phase = 2 + gameBoard[2];
    } else if (
        gameBoard[2] == gameBoard[4] &&
        gameBoard[4] == gameBoard[6] &&
        gameBoard[4] != undefined
    ) {
        phase = 2 + gameBoard[2];
    }

    if (phase == 1) {
        phase = 4;
        for (let i = 0; i < 9; i++) {
            if (gameBoard[i] == undefined) {
                phase = 1;
                break;
            }
        }
    }

    return phase;
}

function runGame(buttonId, round, gameBoard, user) {
    const embed = new EmbedBuilder()
        .setTitle("Game started")
        .setDescription(`The current turn belongs to player <@${user[round % 2].id}>`);
    let components = new Array(3);
    for (let i = 0; i < 3; i++) {
        let row;
        let buttons = new Array(3);
        gameBoard[buttonId] = round % 2;
        for (let j = 0; j < 3; j++) {
            const number = i * 3 + j;
            let button;

            if (gameBoard[number] == 0) {
                button = new ButtonBuilder()
                    .setEmoji("⭕")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`${number}`)
                    .setDisabled(true);
            } else if (gameBoard[number] == 1) {
                button = new ButtonBuilder()
                    .setEmoji("❌")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`${number}`)
                    .setDisabled(true);
            } else {
                button = new ButtonBuilder()
                    .setEmoji("❓")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`${number}`);
            }
            buttons[j] = button;
        }
        row = new ActionRowBuilder().addComponents(buttons);
        components[i] = row;
    }
    return { embeds: [embed], components: components };
}

function setGame(gameBoard, user) {
    const embed = new EmbedBuilder()
        .setTitle("Game started")
        .setDescription(`The current turn belongs to player <@${user[0].id}>`);

    for (let i = 0; i < 9; i++) {
        gameBoard[i] = undefined;
    }

    let components = new Array(3);
    for (let i = 0; i < 3; i++) {
        let row;
        let buttons = new Array(3);
        for (let j = 0; j < 3; j++) {
            const number = i * 3 + j;
            const button = new ButtonBuilder()
                .setEmoji("❓")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`${number}`);

            buttons[j] = button;
        }
        row = new ActionRowBuilder().addComponents(buttons);
        components[i] = row;
    }
    return { embeds: [embed], components: components };
}

function startGame(user1, user2) {
    let embed;

    const yesButton = new ButtonBuilder()
        .setEmoji("⭕")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("yes");

    const noButton = new ButtonBuilder()
        .setEmoji("❌")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("no");

    const cancelButton = new ButtonBuilder()
        .setLabel("Cancel the game")
        .setStyle(ButtonStyle.Danger)
        .setCustomId("cancel");

    const row = new ActionRowBuilder().addComponents(noButton, yesButton, cancelButton);

    embed = new EmbedBuilder()
        .setTitle("Let's play tic tac toe")
        .setDescription(`Player <@${user1.id}> has sent a challenge to <@${user2.id}> and is waiting for a response. Please wait a moment`);

    return { embeds: [embed], components: [row] };
}

function sendRefuse() {
    const embed = new EmbedBuilder()
        .setTitle("Invitation refused")
        .setDescription("Your invitation has not been responded to or has been declined by the player");
    const yesButton = new ButtonBuilder()
        .setEmoji("⭕")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("yes")
        .setDisabled(true);
    const noButton = new ButtonBuilder()
        .setEmoji("❌")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("no")
        .setDisabled(true);
    const row = new ActionRowBuilder().addComponents(noButton, yesButton);
    return { embeds: [embed], components: [row] };
}