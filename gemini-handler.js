// File: api/gemini-handler.js
// CODE NÀY CHẠY TRÊN VERCEL (GỌI GEMINI)

// Tải thư viện Google AI (Vercel sẽ tự cài)
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Lấy API Key đã giấu trên Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Hàm xử lý chính
export default async function handler(req, res) {

  // Chỉ chấp nhận POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Lấy câu hỏi từ frontend
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Chọn model Gemini (flash là bản nhanh và miễn phí)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Gọi Gemini
    const result = await model.generateContent(question);
    const response = await result.response;
    const text = response.text();

    // Trả lời về cho frontend
    res.status(200).json({ answer: text });

  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error); // Ghi log lỗi chi tiết trên Vercel
    res.status(500).json({ error: 'Lỗi kết nối đến AI.' });
  }
}