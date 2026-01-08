// สร้างไฟล์นี้ที่ /api/redeem.js ใน Vercel project

export default async function handler(req, res) {
  // อนุญาตให้เรียกจากทุก origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { memberId, couponCode } = req.body;

    // ตรวจสอบ input
    if (!memberId || !couponCode) {
      res.status(400).json({ 
        success: false, 
        message: 'กรุณาระบุ memberId และ couponCode' 
      });
      return;
    }

    // เรียก Netmarble API
    const response = await fetch('https://coupon.netmarble.com/api/tskgb/coupon/use', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        memberId: memberId,
        couponCode: couponCode
      })
    });

    const data = await response.json();

    // ส่งผลลัพธ์กลับ
    res.status(200).json({
      success: data.resultCode === 'SUCCESS' || response.ok,
      message: data.resultMessage || data.message || 'เกิดข้อผิดพลาด',
      data: data
    });

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' 
    });
  }
}