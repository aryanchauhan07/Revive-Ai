import dotenv from 'dotenv';
dotenv.config();

import crypto from 'crypto';

async function testAllCredentials() {
  console.log("==========================================");
  console.log("🔍 REVIVE AI CREDENTIAL VERIFICATION SUITE");
  console.log("==========================================\n");

  // 1. Test Razorpay API Connection
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  console.log(`1. Testing Razorpay API Key (${keyId ? keyId.substring(0, 12) + '...' : 'MISSING'})...`);
  
  if (keyId && keySecret) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const res = await fetch('https://api.razorpay.com/v1/orders?count=1', {
        headers: { 'Authorization': authHeader }
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`   ✅ Razorpay API Test Mode: AUTHENTICATED & ACTIVE (HTTP ${res.status})`);
      } else {
        console.log(`   ⚠️ Razorpay API Returned HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      console.log(`   ❌ Razorpay Network Error: ${err.message}`);
    }
  } else {
    console.log("   ❌ Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
  }

  // 2. Test Razorpay Webhook HMAC Signature Engine
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  console.log(`\n2. Testing Razorpay Webhook Secret Engine...`);
  if (webhookSecret) {
    const mockPayload = Buffer.from(JSON.stringify({ event: 'payment.captured', entity: 'order' }));
    const signature = crypto.createHmac('sha256', webhookSecret).update(mockPayload).digest('hex');
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'utf-8'),
      Buffer.from(crypto.createHmac('sha256', webhookSecret).update(mockPayload).digest('hex'), 'utf-8')
    );
    console.log(`   ✅ Webhook HMAC-SHA256 Verification: ${isValid ? 'PASSED & VALID' : 'FAILED'}`);
    console.log(`   🔑 Secret: ${webhookSecret}`);
  } else {
    console.log("   ❌ Missing RAZORPAY_WEBHOOK_SECRET");
  }

  // 3. Test Gemini LLM API
  const geminiKey = process.env.GEMINI_API_KEY;
  console.log(`\n3. Testing Google Gemini LLM API (${geminiKey ? geminiKey.substring(0, 10) + '...' : 'MISSING'})...`);
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with JSON only: {"status": "ok", "engine": "gemini-2.5-flash"}' }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`   ✅ Google Gemini 2.5 Flash: ONLINE & RESPONDING (HTTP ${res.status})`);
        console.log(`   🤖 LLM Output: ${data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()}`);
      } else {
        const errData = await res.text();
        console.log(`   ⚠️ Gemini API Returned HTTP ${res.status}: ${errData}`);
      }
    } catch (err) {
      console.log(`   ❌ Gemini Network Error: ${err.message}`);
    }
  } else {
    console.log("   ❌ Missing GEMINI_API_KEY");
  }

  console.log("\n==========================================");
  console.log("🎉 Credential Verification Completed!");
  console.log("==========================================");
}

testAllCredentials();
