// require("dotenv").config();
// const express = require("express");
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const router = express.Router();

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// const SYSTEM_PROMPT_AR = `
// أنت مساعد ذكي متخصص في تقديم استشارات ومعلومات طبية فقط.
// الرجاء الرد بإجابات قصيرة ومباشرة.
// لا تجب على أي أسئلة لا تتعلق بالصحة أو المجال الطبي.
// إذا تم سؤالك عن شيء خارج المجال الطبي، فقم بالرد بهذه الجملة:
// "من فضلك اسأل سؤال له علاقة بالصحة أو المجال الطبي."
// ويجب أن تكون كل إجاباتك باللغة العربية فقط.
// `;

// const SYSTEM_PROMPT_EN = `
// You are an intelligent assistant specialized in providing only medical advice and information.
// Please respond with short and direct answers only.
// Do not answer any questions unrelated to health or the medical field.
// If asked about anything outside the medical field, reply with:
// "Please ask a question related to health or the medical field."
// All your responses should be in English only.
// `;

// function isArabic(text) {
//   const arabicRegex = /[\u0600-\u06FF]/;
//   return arabicRegex.test(text);
// }

// router.post("/chat", async (req, res) => {
//   const { message } = req.body;

//   if (!message) {
//     return res.status(400).json({ error: "Message is required" });
//   }

//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

//     const selectedPrompt = isArabic(message)
//       ? SYSTEM_PROMPT_AR
//       : SYSTEM_PROMPT_EN;

//     const chat = model.startChat({
//       history: [{ role: "user", parts: [{ text: selectedPrompt }] }],
//     });

//     const result = await chat.sendMessage(message, {
//       max_tokens: 100,
//       temperature: 0.5,
//     });

//     const response = await result.response;
//     const text = response.text();

//     res.json({ reply: text });
//   } catch (err) {
//     console.error("Error generating response:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

require("dotenv").config();
const express = require("express");
const {
  default: ModelClient,
  isUnexpected,
} = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");

const router = express.Router();

const endpoint = "https://models.github.ai/inference";
const modelName = "openai/gpt-4.1";

const SYSTEM_PROMPT_AR = `
أنت مساعد ذكي متخصص في تقديم استشارات ومعلومات طبية فقط.
الرجاء الرد بإجابات قصيرة ومباشرة.
لا تجب على أي أسئلة لا تتعلق بالصحة أو المجال الطبي.
إذا تم سؤالك عن شيء خارج المجال الطبي، فقم بالرد بهذه الجملة:
"من فضلك اسأل سؤال له علاقة بالصحة أو المجال الطبي."
ويجب أن تكون كل إجاباتك باللغة العربية فقط.
`;

const SYSTEM_PROMPT_EN = `
You are an intelligent assistant specialized in providing only medical advice and information.
Please respond with short and direct answers only.
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
    const token = process.env.AZURE_GITHUB_AI_TOKEN;
    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const selectedPrompt = isArabic(message)
      ? SYSTEM_PROMPT_AR
      : SYSTEM_PROMPT_EN;

    const response = await client.path("/chat/completions").post({
      body: {
        model: modelName,
        messages: [
          { role: "system", content: selectedPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.5,
        top_p: 1,
      },
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    const reply = response.body.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("Error generating response:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
