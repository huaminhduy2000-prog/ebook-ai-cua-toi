// File: api/chat.js
// CODE NÀY CHẠY TRÊN MÁY CHỦ VERCEL (GỌI HUGGING FACE)

// Địa chỉ của mô hình AI nguồn mở
const MODEL_URL = "https://api-inference.huggingface.co/models/google/flan-t5-base"; // <-- Thử model Flan-T5

// Hàm xử lý chính (Serverless Function)
export default async function handler(req, res) {

  // Chỉ chấp nhận yêu cầu POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Lấy câu hỏi từ yêu cầu gửi lên
    const { question } = req.body;

    // Kiểm tra xem có câu hỏi không
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Gọi API của Hugging Face
    const response = await fetch(
      MODEL_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Lấy Token bí mật đã lưu trên Vercel
          'Authorization': `Bearer ${process.env.HF_TOKEN}`
        },
        body: JSON.stringify({
          // Định dạng câu hỏi cho mô hình Mistral Instruct
          // Yêu cầu trả lời bằng tiếng Việt, ngắn gọn
          inputs: `<s>[INST] ${question} (Please answer in 1-2 sentences in Vietnamese) [/INST]`
        }),
      }
    );

   // Xử lý nếu Hugging Face trả về lỗi (ví dụ: mô hình đang khởi động)
        if (!response.ok) {
          // === CODE MỚI ĐỂ GHI LOG CHI TIẾT ===
          const statusCode = response.status; // Lấy mã trạng thái (ví dụ: 404)
          const errorText = await response.text(); // Lấy NỘI DUNG trang lỗi
          console.error(`Hugging Face API Error: Status ${statusCode}`, errorText); // Ghi lại cả hai
          // === KẾT THÚC CODE MỚI ===

          // Trả về lỗi thân thiện cho người dùng (vẫn giữ nguyên)
          return res.status(500).json({ answer: `Xin lỗi, có lỗi từ máy chủ AI (Status: ${statusCode}). Vui lòng thử lại sau!` });
        }

    // Lấy kết quả JSON từ Hugging Face
    const jsonResponse = await response.json();

    // Trích xuất phần văn bản được tạo ra
    let rawAnswer = jsonResponse[0].generated_text;

    // Dọn dẹp câu trả lời (bỏ phần câu hỏi lặp lại)
    let cleanAnswer = rawAnswer.split("[/INST]")[1];

    // Trả câu trả lời về cho giao diện (frontend)
    res.status(200).json({
      answer: cleanAnswer || "Xin lỗi, tôi không chắc làm thế nào để trả lời điều đó."
    });

  } catch (error) {
    // Xử lý lỗi chung của máy chủ
    console.error(error);
    res.status(500).json({ error: 'Đã xảy ra lỗi máy chủ nội bộ.' });
  }
}
