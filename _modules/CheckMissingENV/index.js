export default function CheckMissingENV(process) {
    const required = [
        "BOT_TOKEN",
        "CLIENT_ID",
        "MONGO_URI",
        "OPEN_AI_KEY",
        "ADMIN_USER_ID"
    ];

    const optional = [
        "HOST",
        "PORT"
    ];

    const missingRequired = [];
    required.forEach(envName => {
        if (!(process.env[envName])) missingRequired.push(envName);
    });

    const missingOptional = [];
    optional.forEach(envName => {
        if (!(process.env[envName])) missingOptional.push(envName);
    });

    return {
        required: missingRequired,
        optional: missingOptional
    };
}