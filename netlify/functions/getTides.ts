import { Handler } from '@netlify/functions';
import axios from 'axios';

const OBS_CODE = 'DT_0018'; // Gunsan Code

const getDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

export const handler: Handler = async (event, context) => {
    const API_KEY = process.env.TIDE_API_KEY;

    if (!API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server Configuration Error: TIDE_API_KEY missing" })
        };
    }

    try {
        const now = new Date();
        const kstOffset = 9 * 60 * 60 * 1000; // Netlify is UTC
        const today = new Date(now.getTime() + kstOffset);

        const dates = [
            new Date(today),
            new Date(today.getTime() + 24 * 60 * 60 * 1000),
            new Date(today.getTime() + 48 * 60 * 60 * 1000)
        ];

        const requests = dates.map(date => {
            const dateStr = getDateString(date);
            const url = `http://www.khoa.go.kr/api/oceangrid/tideObsPreTab/search.do?ServiceKey=${API_KEY}&ObsCode=${OBS_CODE}&Date=${dateStr}&ResultType=json`;
            console.log(`Fetching Tide for ${dateStr}`);
            return axios.get(url);
        });

        const responses = await Promise.all(requests);

        const result = responses.map((res, index) => {
            const dateStr = getDateString(dates[index]);
            // Format: M.D
            const displayDate = `${parseInt(dateStr.substring(4, 6))}.${parseInt(dateStr.substring(6, 8))}`;

            if (!res.data || !res.data.result || !res.data.result.data) {
                return { date: displayDate, tides: [] };
            }

            // Khoa returns raw list. We need to parse time and height.
            // Data format: { tph_time: '2025-12-26 04:30:00', tph_level: '123', hl_code: '고조' }
            const tideData = res.data.result.data.map((item: any) => ({
                time: item.tph_time.split(' ')[1].substring(0, 5), // '04:30'
                height: item.tph_level,
                type: item.hl_code === '고조' ? 'high' : 'low'
            }));

            return {
                date: displayDate,
                tides: tideData
            };
        });

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result)
        };

    } catch (error: any) {
        console.error("Tide Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch tide data", details: error.message })
        };
    }
};
