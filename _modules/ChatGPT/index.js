import axios from "axios";


const openAi = "https://api.openai.com/v1/chat/completions";
const openAiKey = (process.env.OPEN_AI_KEY);

export default async function requestChat(messages) {
    const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: openAi,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAiKey}`,
            "Accept-Encoding": "gzip,deflate,compress"
        },
        data: {
            "model": "gpt-3.5-turbo-16k",
            "max_tokens": 1500,
            "temperature": 0.7,
            "messages": messages
        }
    };

    try {
        const response = await axios.request(config);
        return response.data;
    }
    catch (error) {
        if (error?.response?.status === 400 && error?.response?.data?.error?.code === "context_length_exceeded") {
            console.log(messages);
            console.log(error?.response?.data?.error);
            return {
                error: ""
            };
        }
        else {
            console.error(error);
            throw new Error("An error occurred while requesting ChatGPT API");
        }
    }
}