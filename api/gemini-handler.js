// File: api/gemini-handler.js
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// Lấy API Key đã giấu trên Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cấu hình an toàn (safety settings) - Quan trọng để tránh bị chặn
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Chọn model gemini-pro và áp dụng cấu hình an toàn
    const model = genAI.getGenerativeModel({ model: "gemini-pro", safetySettings });

    // Gọi Gemini
    const result = await model.generateContent(question);
    const response = await result.response;

    // Kiểm tra xem có bị chặn vì lý do an toàn không
    if (response.promptFeedback?.blockReason) {
       console.error("Gemini API Blocked:", response.promptFeedback.blockReason);
       return res.status(400).json({ error: `Câu hỏi bị chặn vì lý do an toàn: ${response.promptFeedback.blockReason}` });
    }

    const text = response.text();

    res.status(200).json({ answer: text });

  } catch (error) {
    // Ghi log lỗi chi tiết hơn
    console.error("Lỗi Backend khi gọi Gemini API:", error.status, error.message, error.errorDetails);
    // Trả về lỗi rõ ràng hơn cho frontend
    res.status(500).json({ error: `Lỗi kết nối đến AI: ${error.message || 'Lỗi không xác định'}` });
  }
}
