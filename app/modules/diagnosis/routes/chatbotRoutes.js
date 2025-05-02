require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const SYSTEM_PROMPT_AR = `
أنت مساعد ذكي متخصص في تقديم استشارات ومعلومات طبية فقط.
لا تجب على أي أسئلة لا تتعلق بالصحة أو المجال الطبي.
إذا تم سؤالك عن شيء خارج المجال الطبي، فقم بالرد بهذه الجملة:
"من فضلك اسأل سؤال له علاقة بالصحة أو المجال الطبي."
ويجب أن تكون كل إجاباتك باللغة العربية فقط.
`;

const SYSTEM_PROMPT_EN = `
You are an intelligent assistant specialized in providing only medical advice and information.
Do not answer any questions unrelated to health or the medical field.
If asked about anything outside the medical field, reply with:
"Please ask a question related to health or the medical field."
All your responses should be in English only.
`;

function isArabic(text) {
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
}

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const selectedPrompt = isArabic(message)
      ? SYSTEM_PROMPT_AR
      : SYSTEM_PROMPT_EN;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: selectedPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "تم فهم التعليمات." }],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

module.exports = router;
