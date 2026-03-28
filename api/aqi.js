// api/aqi.js
// Fetches live AQI from OpenAQ — no API key required

const CITY_LOCATIONS = {
  'Bengaluru': { country: 'IN', city: 'Bengaluru' },
  'Chennai':   { country: 'IN', city: 'Chennai' },
  'Mumbai':    { country: 'IN', city: 'Mumbai' },
  'Hyderabad': { country: 'IN', city: 'Hyderabad' },
  'Delhi':     { country: 'IN', city: 'Delhi' },
  'Pune':      { country: 'IN', city: 'Pune' }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { city } = req.query;
  const loc = CITY_LOCATIONS[city];
  if (!loc) return res.status(400).json({ error: 'Invalid city' });

  try {
    const url = `https://api.openaq.org/v2/latest?city=${encodeURIComponent(loc.city)}&country=${loc.country}&parameter=pm25&limit=5&sort=desc`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      // Return a realistic fallback if OpenAQ has no recent data
      return res.status(200).json({
        city,
        pm25: null,
        aqi_approx: null,
        source: 'unavailable',
        message: 'No recent sensor data from OpenAQ for this city',
        timestamp: new Date().toISOString()
      });
    }

    // Find the most recent PM2.5 reading
    let bestReading = null;
    for (const result of data.results) {
      for (const measurement of result.measurements) {
        if (measurement.parameter === 'pm25' && measurement.value > 0) {
          if (!bestReading || new Date(measurement.lastUpdated) > new Date(bestReading.lastUpdated)) {
            bestReading = measurement;
          }
        }
      }
    }

    if (!bestReading) {
      return res.status(200).json({ city, pm25: null, aqi_approx: null, source: 'no_pm25', timestamp: new Date().toISOString() });
    }

    // Convert PM2.5 to approximate AQI (US EPA breakpoints)
    const pm25 = Math.round(bestReading.value);
    const aqi = pm25ToAQI(pm25);

    return res.status(200).json({
      city,
      pm25,
      aqi_approx: aqi,
      category: aqiCategory(aqi),
      source: result?.location || 'OpenAQ',
      last_updated: bestReading.lastUpdated,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('AQI fetch error:', err);
    return res.status(500).json({ error: 'AQI service error' });
  }
}

function pm25ToAQI(pm25) {
  // EPA linear interpolation
  const breakpoints = [
    [0, 12.0, 0, 50],
    [12.1, 35.4, 51, 100],
    [35.5, 55.4, 101, 150],
    [55.5, 150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 350.4, 301, 400],
    [350.5, 500.4, 401, 500]
  ];
  for (const [cLow, cHigh, iLow, iHigh] of breakpoints) {
    if (pm25 >= cLow && pm25 <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (pm25 - cLow) + iLow);
    }
  }
  return 500;
}

function aqiCategory(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}
