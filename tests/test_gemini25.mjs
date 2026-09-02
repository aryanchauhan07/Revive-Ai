import dotenv from 'dotenv';
dotenv.config();

async function testGemini25() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Respond with valid JSON: {"status": "ok", "engine": "gemini-2.5-flash"}' }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

testGemini25();
