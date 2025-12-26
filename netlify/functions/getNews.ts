import { Handler } from '@netlify/functions';
import axios from 'axios';

export const handler: Handler = async (event, context) => {
    const url = event.queryStringParameters?.url;

    if (!url) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "URL parameter depends missing" })
        };
    }

    try {
        const response = await axios.get(url, {
            headers: {
                // Imitate a real browser to avoid blocking
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 5000 // 5s timeout
        });

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/xml", // RSS is usually XML
                "Cache-Control": "public, max-age=300" // Cache for 5 mins
            },
            body: response.data
        };

    } catch (error: any) {
        console.error("News Fetch Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Failed to fetch news",
                details: error.message
            })
        };
    }
};
