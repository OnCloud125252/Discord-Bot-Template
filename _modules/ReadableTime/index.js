export default function ReadableTime(milliseconds) {
    let year,
        month,
        day,
        hour,
        minute,
        second;

    second = Math.floor(milliseconds / 1000);
    minute = Math.floor(second / 60);
    second = second % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    month = Math.floor(day / 30);
    day = day % 30;
    year = Math.floor(month / 12);
    month = month % 12;

    return {
        "specific": {
            year,
            month,
            day,
            hour,
            minute,
            second
        },
        "string": [
            (year ? `${year} years` : null),
            (month ? `${month} months` : null),
            (day ? `${day} days` : null),
            (hour ? `${hour} hours` : null),
            (minute ? `${minute} minute` : null),
            (second ? `${second} seconds` : null)
        ].filter(ele => ele).join(", ")
    };
}