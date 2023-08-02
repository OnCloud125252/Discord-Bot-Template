import play from "play-dl";
import { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus } from "@discordjs/voice";


export default class MusicPlayer {
    constructor() {
        this.isPlaying = {};
        this.queue = {};
        this.connection = {};
        this.dispatcher = {};
    }

    // 判斷網址是否為播放清單
    isPlayList(url) {
        if (url.indexOf("&list") > -1 && url.indexOf("music.youtube") < 0) {
            return true;
        }

        return false;
    }

    // 將機器人加入語音、處理歌曲資訊
    async play(interaction, musicURL, voiceChannelID) {
        const guildID = interaction.guildId;

        this.connection[guildID] = joinVoiceChannel({
            channelId: voiceChannelID,
            guildId: guildID,
            adapterCreator: interaction.guild.voiceAdapterCreator
        });

        try {
            if (!this.queue[guildID]) {
                this.queue[guildID] = [];
            }

            let musicName = null;

            const isPlayList = this.isPlayList(musicURL);
            if (isPlayList) {
                const res = await play.playlist_info(musicURL);
                musicName = res.title;

                const videoTitles = res.videos.map((v, i) => `[${i + 1}] ${v.title}`).slice(0, 10).join("\n");
                interaction.channel.send(`**加入播放清單：${musicName}**\nID 識別碼：[${res.id}]\n==========================\n${videoTitles}\n……以及其他 ${res.videos.length - 10} 首歌 `);

                res.videos.forEach(v => {
                    this.queue[guildID].push({
                        id: res.id,
                        name: v.title,
                        url: v.url
                    });
                });

            } else {
                const res = await play.video_basic_info(musicURL);
                musicName = res.video_details.title;

                this.queue[guildID].push({
                    id: res.video_details.id,
                    name: musicName,
                    url: musicURL
                });
            }

            if (this.isPlaying[guildID]) {
                interaction.reply({
                    embeds: [{
                        author: {
                            name: "Added to queue"
                        },
                        title: musicName,
                        url: musicURL,
                        color: 0x00f5e4,
                        footer: {
                            text: "Music Player",
                            icon_url: "https://i.ibb.co/CnqFvTF/image-2023-07-06-152548513.jpg"
                        },
                        timestamp: new Date()
                    }]
                });
            } else {
                this.isPlaying[guildID] = true;
                this.playMusic(interaction, this.queue[guildID][0], false);
            }

        } catch (e) {
            console.log(e);
            interaction.reply({
                embeds: [{
                    author: {
                        name: "Error"
                    },
                    title: "Please enter a valid YouTube URL",
                    color: 0xff0000,
                    footer: {
                        text: "Music Player",
                        icon_url: "https://i.ibb.co/CnqFvTF/image-2023-07-06-152548513.jpg"
                    },
                    timestamp: new Date()
                }]
            });
        }
    }

    playNextMusic(interaction) {
        const guildID = interaction.guildId;

        if (this.queue[guildID]?.length > 0) {
            this.playMusic(interaction, this.queue[guildID][0], false);
        }
        else {
            this.isPlaying[guildID] = false;
            interaction.reply({
                embeds: [{
                    author: {
                        name: "Error"
                    },
                    title: "Can't skip any music",
                    color: 0xff0000,
                    footer: {
                        text: "Music Player",
                        icon_url: "https://i.ibb.co/CnqFvTF/image-2023-07-06-152548513.jpg"
                    },
                    timestamp: new Date()
                }]
            });
        }
    }

    async playMusic(interaction, musicInfo, isReplied) {
        const guildID = interaction.guildId;

        try {
            if (!isReplied) {
                interaction.reply({
                    embeds: [{
                        author: {
                            name: "Now Playing"
                        },
                        title: musicInfo.name,
                        url: musicInfo.url,
                        color: 0x9f00f5,
                        footer: {
                            text: "Music Player",
                            icon_url: "https://i.ibb.co/CnqFvTF/image-2023-07-06-152548513.jpg"
                        },
                        timestamp: new Date()
                    }]
                });
            }

            const stream = await play.stream(musicInfo.url);
            const resource = createAudioResource(stream.stream, {
                inputType: stream.type
            });

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play
                }
            });

            player.play(resource);

            this.connection[guildID].subscribe(player);
            this.dispatcher[guildID] = player;

            this.queue[guildID].shift();

            player.on("stateChange", (oldState, newState) => {
                if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                    this.playNextMusic(interaction);
                }
            });
        } catch (e) {
            console.log(e);
            interaction.channel.send({
                embeds: [{
                    author: {
                        name: "Error"
                    },
                    title: "Error processing music",
                    color: 0xff0000,
                    footer: {
                        text: "Music Player",
                        icon_url: "https://i.ibb.co/CnqFvTF/image-2023-07-06-152548513.jpg"
                    },
                    timestamp: new Date()
                }]
            });

            this.queue[guildID].shift();

            this.playNextMusic(interaction);
        }
    }

    // 恢復播放
    resume(interaction) {
        const guildID = interaction.guildId;
        if (this.dispatcher[guildID]) {
            this.dispatcher[guildID].unpause();
            interaction.reply({
                embeds: [{
                    author: {
                        name: "Resume"
                    },
                    title: "Resume playing music",
                    color: 0x00f549,
                    footer: {
                        text: "Music Player",
                        icon_url: "https://i.ibb.co/CnqFvTF/image-2023-07-06-152548513.jpg"
                    },
                    timestamp: new Date()
                }]
            });
        } else {
            interaction.reply({
                embeds: [{
                    author: {
                        name: "Error"
                    },
                    title: "Can't resume any music",
                    color: 0xff0000,
                    footer: {
                        text: "Music Player",
                        icon_url: "https://i.ibb.co/CnqFvTF/image-2023-07-06-152548513.jpg"
                    },
                    timestamp: new Date()
                }]
            });
        }
    }

    // 暫停播放
    pause(interaction) {
        const guildID = interaction.guildId;
        if (this.dispatcher[guildID]) {
            this.dispatcher[guildID].pause();
            interaction.reply({
                embeds: [{
                    author: {
                        name: "Pause"
                    },
                    title: "Pause current music",
                    color: 0xf5ed00,
                    footer: {
                        text: "Music Player",
                        icon_url: "https://i.ibb.co/CnqFvTF/image-2023-07-06-152548513.jpg"
                    },
                    timestamp: new Date()
                }]
            });
        }
        else {
            interaction.reply({
                embeds: [{
                    author: {
                        name: "Error"
                    },
                    title: "Can't pause any music",
                    color: 0xff0000,
                    footer: {
                        text: "Music Player",
                        icon_url: "https://i.ibb.co/CnqFvTF/image-2023-07-06-152548513.jpg"
                    },
                    timestamp: new Date()
                }]
            });
        }
    }

    // 跳過目前歌曲
    skip(interaction) {
        const guildID = interaction.guildId;
        if (this.dispatcher[guildID]) {
            this.dispatcher[guildID].stop();
            interaction.reply({ content: "跳過目前歌曲" });
        } else {
            interaction.reply({ content: "機器人目前未加入頻道" });
        }
    }

    // 取得目前隊列中的歌曲
    nowQueue(interaction) {
        const guildID = interaction.guildId;

        if (this.queue[guildID] && this.queue[guildID].length > 0) {
            let queueString = "";

            let queue = this.queue[guildID].map((item, index) => `[${index + 1}] ${item.name}`);
            if (queue.length > 10) {
                queue = queue.slice(0, 10);
                queueString = `目前歌單：\n${queue.join("\n")}\n……與其他 ${this.queue[guildID].length - 10} 首歌`;
            } else {
                queueString = `目前歌單：\n${queue.join("\n")}`;
            }

            interaction.reply({ content: queueString });
        } else {
            interaction.reply({
                embeds: [{
                    author: {
                        name: "Error"
                    },
                    title: "There are no music in queue",
                    color: 0xff0000,
                    footer: {
                        text: "Music Player",
                        icon_url: "https://i.ibb.co/CnqFvTF/image-2023-07-06-152548513.jpg"
                    },
                    timestamp: new Date()
                }]
            });
        }
    }

    // 刪除隊列中播放清單的所有歌曲
    deletePlayList(interaction, musicID) {
        const guildID = interaction.guildId;

        this.queue[guildID] = this.queue[guildID].filter(q => q.id !== musicID);
        interaction.reply({
            embeds: [{
                author: {
                    name: "Delete"
                },
                title: `Delete music ${musicID} from queue`,
                color: 0xf58300,
                footer: {
                    text: "Music Player",
                    icon_url: "https://i.ibb.co/CnqFvTF/image-2023-07-06-152548513.jpg"
                },
                timestamp: new Date()
            }]
        });
    }

    leave(interaction) {
        const guildID = interaction.guildId;

        if (this.connection[guildID]) {
            if (Object.prototype.hasOwnProperty.call(this.queue, guildID)) {
                delete this.queue[guildID];

                this.isPlaying[guildID] = false;
            }

            this.connection[guildID].disconnect();

            interaction.reply({ content: "離開頻道" });
        } else {
            interaction.reply({ content: "機器人未加入任何頻道" });
        }
    }
}