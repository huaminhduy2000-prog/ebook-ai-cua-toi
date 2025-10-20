// File: api/chat.js
// ĐÂY LÀ CODE CHẠY TRÊN MÁY CHỦ VERCEL (GỌI HUGGING FACE)

// Địa chỉ của mô hình AI nguồn mở chúng ta sẽ dùng
const MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

// Đây là "người gác cổng"
export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // GỌI HUGGING FACE API
    const response = await fetch(
      MODEL_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Sử dụng "Chìa khóa" HF_TOKEN chúng ta đã giấu ở Vercel
          'Authorization': `Bearer ${process.env.HF_TOKEN}` 
        },
        body: JSON.stringify({
          inputs: `<s>[INST] ${question} (Please answer in 1-2 sentences in Vietnamese) [/INST]`
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", errorText);
      return res.status(500).json({ answer: 'Xin lỗi, AI đang khởi động (cold start). Vui lòng thử lại sau 30 giây!' });
    }

    const jsonResponse = await response.json();
    let rawAnswer = jsonResponse[0].generated_text;

    // Dọn dẹp câu trả lời
    let cleanAnswer = rawAnswer.split("[/INST]")[1]; 

    res.status(200).json({ 
        answer: cleanAnswer || "Xin lỗi, tôi không chắc làm thế nào để trả lời điều đó." 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Đã xảy ra lỗi máy chủ nội bộ.' });
  }
}