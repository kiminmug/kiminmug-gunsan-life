import axios from 'axios';

export const fetchKMAWeather = async () => {
    try {
        // Call our own Netlify Function
        const response = await axios.get('/.netlify/functions/getWeather');

        if (!response.data || !response.data.ncst || !response.data.fcst) {
            throw new Error("Invalid Function Response");
        }

        const ncstRes = response.data.ncst;
        const fcstRes = response.data.fcst;

        if (!ncstRes.response?.body || !fcstRes.response?.body) {
            console.error("KMA Invalid Response Body from Function", ncstRes, fcstRes);
            throw new Error("KMA API Error: Invalid Response");
        }

        const ncstItems = ncstRes.response.body.items.item;

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
        const fcstItems = fcstRes.response.body.items.item;
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
        const forecastList = Object.keys(dailyForecasts).slice(0, 5).map(dateStr => {
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
        return { error: "기상청 연결 실패 - API 키를 확인해주세요." };
    }
};
