// api/weather.js
// Proxies WeatherAPI.com — keeps API key server-side

const CITY_QUERY = {
  'Bengaluru': 'Bangalore',
  'Chennai':   'Chennai',
  'Mumbai':    'Mumbai',
  'Hyderabad': 'Hyderabad',
  'Delhi':     'New Delhi',
  'Pune':      'Pune'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { city } = req.query;
  const query = CITY_QUERY[city];

  if (!query) {
    return res.status(400).json({ error: 'Invalid city' });
  }

  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHERAPI_KEY}&q=${encodeURIComponent(query)}&aqi=no`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Normalise to the same shape the frontend expects
    return res.status(200).json({
      city,
      temp:        Math.round(data.current.temp_c),
      feels_like:  Math.round(data.current.feelslike_c),
      humidity:    data.current.humidity,
      description: data.current.condition.text,
      // WeatherAPI gives precip_mm for the last hour
      rain_1h:     data.current.precip_mm || 0,
      wind_speed:  data.current.wind_kph,
      timestamp:   new Date().toISOString()
    });
  } catch (err) {
    console.error('WeatherAPI fetch error:', err);
    return res.status(500).json({ error: 'Weather service error' });
  }
}
