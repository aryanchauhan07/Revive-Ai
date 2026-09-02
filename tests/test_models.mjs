import dotenv from 'dotenv';
dotenv.config();

async function testGeminiModels() {
  const geminiKey = process.env.GEMINI_API_KEY;
  console.log("Listing available Gemini models for API key...");

  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`;
    const res = await fetch(listUrl);
    if (res.ok) {
      const data = await res.json();
      console.log("Available Models:", data.models?.map(m => m.name));
      return;
    }
  } catch (e) {
    console.log("List error:", e.message);
  }

  // Fallback test
  const candidates = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro', 'gemini-pro'];
  for (const model of candidates) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello' }] }] })
      });
      console.log(`Model ${model}: HTTP ${res.status}`);
      if (res.ok) {
        const d = await res.json();
        console.log(`✅ Model ${model} SUCCESS:`, d.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
        break;
      }
    } catch (err) {
      console.log(`Model ${model} error:`, err.message);
    }
  }
}

testGeminiModels();
