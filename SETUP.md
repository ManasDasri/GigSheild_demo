# GigShield — Deployment Guide

## What You Have

```
gigshield/
├── api/
│   ├── send-otp.js       ← Fast2SMS OTP (server-side, key hidden)
│   ├── verify-otp.js     ← OTP verification (server-side)
│   ├── weather.js        ← OpenWeatherMap proxy (key hidden)
│   └── aqi.js            ← OpenAQ live data (no key needed)
├── public/
│   └── index.html        ← Full frontend
├── vercel.json           ← Routing config
└── SETUP.md              ← This file
```

---

## Step 1 — Get Your API Keys (10 minutes)

### Fast2SMS (OTP)
1. Go to https://www.fast2sms.com
2. Sign up with your Indian mobile number
3. Verify email
4. Go to Dev API → Copy your API key
5. Free tier gives you enough credits for demos

### OpenWeatherMap (Live Weather)
1. Go to https://openweathermap.org/api
2. Sign up free
3. Go to API Keys → Copy your default key
4. Free tier: 1,000 calls/day — more than enough

### OpenAQ (AQI)
- No key needed. Fully public API.

---

## Step 2 — Deploy to Vercel (5 minutes)

### Option A — Vercel CLI (recommended)
```bash
npm install -g vercel
cd gigshield
vercel
```
Follow the prompts. Select "No" for existing project. Vercel auto-detects the config.

### Option B — GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new
3. Import your repo
4. Click Deploy

---

## Step 3 — Add Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

| Variable Name         | Value                        |
|-----------------------|------------------------------|
| FAST2SMS_API_KEY      | your Fast2SMS key here       |
| OPENWEATHER_API_KEY   | your OpenWeatherMap key here |

Click Save. Then go to Deployments → Redeploy.

---

## Step 4 — Test It

1. Open your Vercel URL
2. Click "Get Covered"
3. Enter your real Indian mobile number
4. You should receive an OTP SMS within 10-15 seconds
5. Enter OTP, complete onboarding
6. Go to Monitor → Live weather data loads for your city
7. Hit "Simulate Heavy Rain" → watch the payout counter animate

---

## Troubleshooting

**OTP not arriving**
- Check Fast2SMS dashboard → Sent Messages
- Make sure FAST2SMS_API_KEY is set in Vercel env vars
- Redeploy after adding env vars

**Weather showing error**
- Make sure OPENWEATHER_API_KEY is set
- New OpenWeatherMap keys take up to 2 hours to activate after signup

**AQI showing "No sensor"**
- OpenAQ may not have recent data for that city
- This is expected — the sensor just shows "No sensor" and does not break anything

---

## For the Demo Video

Best flow to show judges:
1. Start on Hero — 10 seconds
2. Click Get Covered — enter your real number — show OTP arriving on phone
3. Complete onboarding — 30 seconds
4. Switch to Monitor — show live weather data for Bengaluru
5. Hit Simulate Heavy Rain — show payout counter animate to Rs. 9.4 lakh
6. Show the event log updating in real time
7. Switch to Wallet — show transaction history

Total: under 2 minutes.
