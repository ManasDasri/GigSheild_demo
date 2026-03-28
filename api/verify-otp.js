// api/verify-otp.js
// Vercel serverless function — verifies OTP server-side

// Use global to persist OTP store across function calls on same instance
const otpStore = global._gigshieldOtpStore || (global._gigshieldOtpStore = {});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });

  const cleanPhone = phone.replace(/\s+/g, '').replace('+91', '').slice(-10);
  const record = otpStore[cleanPhone];

  if (!record) {
    return res.status(400).json({ error: 'No OTP found for this number. Please request again.' });
  }
  if (Date.now() > record.expires) {
    delete otpStore[cleanPhone];
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }
  if (record.otp !== otp.toString()) {
    return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });
  }

  delete otpStore[cleanPhone];
  return res.status(200).json({ success: true, message: 'Phone verified successfully' });
}
