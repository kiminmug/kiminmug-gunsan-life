import { Handler } from '@netlify/functions';
import axios from 'axios';

const NX = 63;
const NY = 126;

// Helper to get base_date and base_time
const getCurrentBaseTime = () => {
    const now = new Date();
    // Use Korea Time offset if running on server with different timezone
    // Netlify servers are usually UTC, need to add 9 hours
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);

    // Logic: Look back 1 hour if minutes < 45
    if (kstDate.getUTCMinutes() < 45) {
        kstDate.setUTCHours(kstDate.getUTCHours() - 1);
    }

    const year = kstDate.getUTCFullYear();
    const month = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(kstDate.getUTCDate()).padStart(2, '0');
    const hours = String(kstDate.getUTCHours()).padStart(2, '0');

    return {
        base_date: `${year}${month}${day}`,
        base_time: `${hours}00`
    };
};

const getForecastBaseTime = () => {
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);

    const validHours = [2, 5, 8, 11, 14, 17, 20, 23];
    let currentHour = kstDate.getUTCHours();

    if (kstDate.getUTCMinutes() < 15) {
        currentHour -= 1;
    }

    let baseHour = validHours.slice().reverse().find(h => h <= currentHour);
    let date = kstDate;

    if (baseHour === undefined) {
        baseHour = 23;
        date = new Date(kstDate.getTime() - 24 * 60 * 60 * 1000);
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(baseHour).padStart(2, '0');

    return {
        base_date: `${year}${month}${day}`,
        base_time: `${hours}00`
    };
};

export const handler: Handler = async (event, context) => {
    const API_KEY = process.env.WEATHER_API_KEY;

    if (!API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server Configuration Error: WEATHER_API_KEY missing" })
        };
    }

    try {
        const { base_date: ncstDate, base_time: ncstTime } = getCurrentBaseTime();
        const { base_date: fcstDate, base_time: fcstTime } = getForecastBaseTime();

        // Construct URLs manually to ensure key is NOT encoded
        const ncstUrl = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=10&dataType=JSON&base_date=${ncstDate}&base_time=${ncstTime}&nx=${NX}&ny=${NY}`;
        const fcstUrl = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=300&dataType=JSON&base_date=${fcstDate}&base_time=${fcstTime}&nx=${NX}&ny=${NY}`;

        console.log(`Fetching NCST: ${ncstDate} ${ncstTime}`);
        console.log(`Fetching FCST: ${fcstDate} ${fcstTime}`);

        const [ncstRes, fcstRes] = await Promise.all([
            axios.get(ncstUrl),
            axios.get(fcstUrl)
        ]);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ncst: ncstRes.data,
                fcst: fcstRes.data
            })
        };

    } catch (error: any) {
        console.error("Netlify Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Failed to fetch weather data",
                details: error.message
            })
        };
    }
};
