// ไฟล์: api/redeem.js
// วางไฟล์นี้ใน folder api/ ของ Vercel project

export default async function handler(req, res) {
  // อนุญาต CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { memberId, couponCode } = req.body;

    if (!memberId || !couponCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณาระบุ memberId และ couponCode' 
      });
    }

    // เรียก Netmarble API ผ่าน Server
    const formData = new URLSearchParams();
    formData.append('memberId', memberId);
    formData.append('couponCode', couponCode);

    const response = await fetch('https://coupon.netmarble.com/api/tskgb/coupon/use', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: formData.toString()
    });

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      // พยายาม parse JSON
      try {
        data = JSON.parse(text);
      } catch {
        data = { resultCode: 'UNKNOWN', resultMessage: text };
      }
    }

    // ตรวจสอบ resultCode
    const isSuccess = 
      data.resultCode === 'SUCCESS' || 
      data.resultCode === '0000' ||
      response.status === 200;

    return res.status(200).json({
      success: isSuccess,
      message: data.resultMessage || data.message || (isSuccess ? 'สำเร็จ' : 'ล้มเหลว'),
      code: data.resultCode,
      rawData: data
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาด: ' + error.message 
    });
  }
}