import axios from "axios";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";


const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function searchMusic(string) {
    const cache = JSON.parse(readFileSync(join(__dirname, "cache.json"), "utf8"));
    try {
        if (cache[string]) {
            cache[string] = {
                id: cache[string].id,
                timestamp: new Date()
            };
        }
        else {
            const response = await axios.get(
                "https://youtube.googleapis.com/youtube/v3/search",
                {
                    params:
                    {
                        q: string,
                        channelType: "any",
                        type: "video",
                        maxResults: "1",
                        key: "AIzaSyBnzGmRG1FyITDirEenlEHkqzJgTVeHusE"
                    }
                }
            );

            cache[string] = {
                id: response.data["items"][0]["id"]["videoId"],
                timestamp: new Date()
            };
        }

        return cache[string].id;
    }
    catch (error) {
        throw new Error("Music not found");
    }
    finally {
        writeFileSync(join(__dirname, "cache.json"), JSON.stringify(cache, null, 4));
    }
}