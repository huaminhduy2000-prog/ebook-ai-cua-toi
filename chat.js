// File: chat.js (ở thư mục GỐC)
// CODE NÀY CHẠY TRÊN TRÌNH DUYỆT (GỌI /api/gemini-handler)

// Chỉ chạy code khi toàn bộ HTML đã tải xong
document.addEventListener("DOMContentLoaded", () => {
    
  // 1. LẤY LINH KIỆN TỪ HTML
  const sendButton = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatWindow = document.getElementById("chat-window");

  // Kiểm tra lỗi nếu không tìm thấy phần tử HTML
  if (!sendButton || !userInput || !chatWindow) {
      console.error("LỖI: Không tìm thấy nút gửi, ô nhập, hoặc cửa sổ chat. Kiểm tra lại ID trong index.html!");
      return; 
  }

  // 2. NỐI DÂY ĐIỆN CHO NÚT GỬI
  sendButton.addEventListener("click", sendMessage);

  // 3. NỐI DÂY ĐIỆN CHO PHÍM ENTER
  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Ngăn Enter tạo dòng mới
      sendMessage();
    }
  });

  // 4. HÀM GỬI TIN NHẮN (ĐÃ CẬP NHẬT ĐỂ GỌI /api/gemini-handler)
  async function sendMessage() {
    let question = userInput.value.trim(); 
    if (question === "") return; 

    addMessage(question, "user"); // Hiển thị tin nhắn người dùng
    userInput.value = ""; // Xóa ô nhập
    showTypingIndicator(); // Hiển thị dấu "..."

    try {
      // GỌI "BỘ NÃO" GEMINI MỚI TẠI /api/gemini-handler
      const response = await fetch('/api/gemini-handler', { // <-- ĐÃ SỬA ĐƯỜNG DẪN
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question }) // Gửi đi {"question": "..."}
      });

      const data = await response.json(); // Nhận về {"answer": "..."} hoặc {"error": "..."}

      // Nếu backend trả về lỗi
      if (!response.ok) {
        // Ưu tiên hiển thị lỗi cụ thể từ backend nếu có
        throw new Error(data.error || 'Lỗi mạng hoặc máy chủ AI.'); 
      }
      
      removeTypingIndicator(); // Xóa dấu "..."
      addMessage(data.answer, "ai"); // Hiển thị câu trả lời THẬT từ Gemini

    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      removeTypingIndicator(); // Vẫn xóa dấu "..." nếu có lỗi
      // Hiển thị lỗi ra chatbox
      addMessage(`Xin lỗi, đã xảy ra sự cố: ${error.message}`, "ai");
    }
  }

  // 5. HÀM THÊM TIN NHẮN VÀO CỬA SỔ
  function addMessage(message, sender) {
    const messageElement = document.createElement("p");
    messageElement.className = sender === "user" ? "user-message" : "ai-message";
    // Dùng textContent cho tin nhắn người dùng (an toàn hơn)
    // Dùng innerHTML cho tin nhắn AI để xử lý xuống dòng (\n -> <br>)
    if (sender === 'user') {
        messageElement.textContent = message;
    } else {
         // Kiểm tra message có tồn tại không trước khi replace
         messageElement.innerHTML = message ? message.replace(/\n/g, '<br>') : '';
    }
    chatWindow.appendChild(messageElement);
    // Tự động cuộn xuống tin nhắn mới nhất
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // 6. HÀM HIỂN THỊ "ĐANG GÕ..."
  function showTypingIndicator() {
    // Chỉ thêm nếu chưa có
    if (document.getElementById("typing-indicator")) return;
    const typingIndicator = document.createElement("p");
    typingIndicator.className = "ai-message typing-indicator";
    typingIndicator.id = "typing-indicator";
    typingIndicator.innerHTML = "<span></span><span></span><span></span>";
    chatWindow.appendChild(typingIndicator);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // 7. HÀM XÓA "ĐANG GÕ..."
  function removeTypingIndicator() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) {
      chatWindow.removeChild(indicator);
    }
  }
}); // Kết thúc DOMContentLoaded