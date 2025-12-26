import axios from 'axios';

const API_KEY = 'faf3639d5f28bdc424391ff8e46e29f3070824bccd8b6b633ee6c566cab1d90a';
// Gunsan Grid Coordinates
const NX = 63;
const NY = 126;

// Helper to get base_date and base_time for Ultra Short Term Forecast (Live usually)
const getCurrentBaseTime = () => {
    const now = new Date();

    if (now.getMinutes() < 45) {
        now.setHours(now.getHours() - 1);
    }

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');

    return {
        base_date: `${year}${month}${day}`,
        base_time: `${hours}00`
    };
};

const getForecastBaseTime = () => {
    const now = new Date();
    const validHours = [2, 5, 8, 11, 14, 17, 20, 23];

    let currentHour = now.getHours();
    if (now.getMinutes() < 15) {
        currentHour -= 1;
    }

    let baseHour = validHours.slice().reverse().find(h => h <= currentHour);

    let date = now;
    if (baseHour === undefined) {
        baseHour = 23;
        date = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(baseHour).padStart(2, '0');

    return {
        base_date: `${year}${month}${day}`,
        base_time: `${hours}00`
    };
};

export const fetchKMAWeather = async () => {
    try {
        const { base_date: ncstDate, base_time: ncstTime } = getCurrentBaseTime();

        // 1. Get Real-time Status (UltraSrtNcst)
        const ncstParams = {
            serviceKey: API_KEY,
            pageNo: 1,
            numOfRows: 10,
            dataType: 'JSON',
            base_date: ncstDate,
            base_time: ncstTime,
            nx: NX,
            ny: NY
        };

        const ncstRes = await axios.get('/kma-api/getUltraSrtNcst', { params: ncstParams });

        // 2. Get Forecast (VilageFcst)
        const { base_date: fcstDate, base_time: fcstTime } = getForecastBaseTime();

        const fcstParams = {
            serviceKey: API_KEY,
            pageNo: 1,
            numOfRows: 300,
            dataType: 'JSON',
            base_date: fcstDate,
            base_time: fcstTime,
            nx: NX,
            ny: NY
        };

        const fcstRes = await axios.get('/kma-api/getVilageFcst', { params: fcstParams });

        if (!ncstRes.data?.response?.body || !fcstRes.data?.response?.body) {
            console.error("KMA Invalid Response Body", ncstRes.data, fcstRes.data);
            throw new Error("KMA API Error: Invalid Response");
        }

        const ncstItems = ncstRes.data.response.body.items.item;

        // Parse Current
        const currentData: any = {};
        ncstItems.forEach((item: any) => {
            if (item.category === 'T1H') currentData.temp = item.obsrValue;
            if (item.category === 'REH') currentData.humidity = item.obsrValue;
            if (item.category === 'WSD') currentData.windSpeed = item.obsrValue;
            if (item.category === 'PTY') currentData.rainType = item.obsrValue;
        });

        let condition = "맑음";
        if (currentData.rainType !== '0') {
            const rt = parseInt(currentData.rainType);
            if (rt === 1 || rt === 5) condition = "비";
            else if (rt === 2 || rt === 6) condition = "비/눈";
            else if (rt === 3 || rt === 7) condition = "눈";
        }

        // Parse Forecast
        const fcstItems = fcstRes.data.response.body.items.item;
        const dailyForecasts: any = {};

        fcstItems.forEach((item: any) => {
            const date = item.fcstDate;
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = { temp: [], sky: [], pty: [], pop: [] };
            }
            if (item.category === 'TMP') dailyForecasts[date].temp.push(parseFloat(item.fcstValue));
            if (item.category === 'TMX') dailyForecasts[date].high = parseFloat(item.fcstValue);
            if (item.category === 'TMN') dailyForecasts[date].low = parseFloat(item.fcstValue);
            if (item.category === 'SKY') dailyForecasts[date].sky.push(parseInt(item.fcstValue));
            if (item.category === 'PTY') dailyForecasts[date].pty.push(parseInt(item.fcstValue));
            if (item.category === 'POP') dailyForecasts[date].pop.push(parseInt(item.fcstValue));
        });

        // Convert to Array
        const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        const forecastList = Object.keys(dailyForecasts).slice(0, 3).map(dateStr => {
            const data = dailyForecasts[dateStr];

            const maxTemp = data.high !== undefined ? data.high : Math.max(...data.temp);
            const minTemp = data.low !== undefined ? data.low : Math.min(...data.temp);

            const hasRain = data.pty.some((p: number) => p > 0);
            const avgSky = data.sky.reduce((a: number, b: number) => a + b, 0) / data.sky.length;

            let dayCondition = "맑음";
            if (hasRain) dayCondition = "비";
            else if (avgSky > 3.5) dayCondition = "흐림";
            else if (avgSky > 2.5) dayCondition = "구름많음";

            const maxPop = Math.max(...data.pop, 0);

            const y = parseInt(dateStr.substring(0, 4));
            const m = parseInt(dateStr.substring(4, 6)) - 1;
            const d = parseInt(dateStr.substring(6, 8));
            const dateObj = new Date(y, m, d);

            return {
                day: weekDays[dateObj.getDay()],
                date: `${m + 1}.${d}`,
                high: isFinite(maxTemp) ? maxTemp : 0,
                low: isFinite(minTemp) ? minTemp : 0,
                condition: dayCondition,
                rainProbability: maxPop
            };
        });

        return {
            current: {
                temp: parseFloat(currentData.temp) || 0,
                condition: condition,
                humidity: parseFloat(currentData.humidity) || 0,
                windSpeed: parseFloat(currentData.windSpeed) || 0,
                dustStatus: "좋음", // Placeholder
                description: condition
            },
            forecast: forecastList,
            sourceUrl: "https://www.weather.go.kr"
        };

    } catch (e) {
        console.error("KMA Fetch Error", e);
        // Fallback or specific error handling
        return { error: "기상청 연결 실패 - API 키 또는 네트워크 확인 필요" };
    }
};
