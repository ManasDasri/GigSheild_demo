// api/send-otp.js
// Vercel serverless function — sends OTP via Fast2SMS Quick SMS route

const otpStore = global._gigshieldOtpStore || (global._gigshieldOtpStore = {});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone } = req.body;
  if (!phone || !/^[6-9]\d{9}$/.test(phone.replace(/\s+/g, '').replace('+91', ''))) {
    return res.status(400).json({ error: 'Invalid Indian mobile number' });
  }

  const cleanPhone = phone.replace(/\s+/g, '').replace('+91', '').slice(-10);
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Store with 5-minute expiry in global store shared with verify-otp
  otpStore[cleanPhone] = {
    otp,
    expires: Date.now() + 5 * 60 * 1000
  };

  try {
    const params = new URLSearchParams({
      authorization: process.env.FAST2SMS_API_KEY,
      route: 'q',
      message: `Your GigShield verification code is ${otp}. Valid for 5 minutes. Do not share this with anyone.`,
      numbers: cleanPhone,
      flash: '0'
    });

    const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?${params.toString()}`, {
      method: 'GET',
      headers: { 'accept': 'application/json' }
    });

    const data = await response.json();

    if (data.return === true) {
      return res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } else {
      console.error('Fast2SMS error:', data);
      return res.status(500).json({ error: 'Failed to send OTP', detail: data.message });
    }
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ error: 'SMS service error' });
  }
}
