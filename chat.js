// File: chat.js (ở thư mục GỐC)
// ĐÂY LÀ CODE CHẠY TRÊN TRÌNH DUYỆT CỦA NGƯỜI DÙNG (GỌI /api/chat)

// Chỉ chạy code khi toàn bộ HTML đã tải xong
document.addEventListener("DOMContentLoaded", () => {

  // 1. LẤY LINH KIỆN TỪ HTML
  const sendButton = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatWindow = document.getElementById("chat-window");

  // Kiểm tra xem có tìm thấy nút không (để bắt lỗi)
  if (!sendButton) {
      console.error("LỖI: Không tìm thấy 'send-button'. Kiểm tra ID trong file index.html!");
      return; 
  }
  if (!userInput) {
      console.error("LỖI: Không tìm thấy 'user-input'.");
      return;
  }
  if (!chatWindow) {
      console.error("LỖI: Không tìm thấy 'chat-window'.");
      return;
  }

  // 2. NỐI DÂY ĐIỆN CHO NÚT GỬI
  sendButton.addEventListener("click", sendMessage);

  // 3. NỐI DÂY ĐIỆN CHO PHÍM ENTER
  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); 
      sendMessage();
    }
  });

  // 4. HÀM GỬI TIN NHẮN (GỌI AI THẬT QUA /api/chat)
  async function sendMessage() {
    let question = userInput.value.trim(); 
    if (question === "") return; 

    addMessage(question, "user");
    userInput.value = ""; 

    showTypingIndicator(); // Hiển thị "..."

    try {
      // GỌI "NGƯỜI GÁC CỔNG" (file /api/chat.js)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question }) // Gửi đi {"question": "..."}
      });

      const data = await response.json(); 

      if (!response.ok) {
        throw new Error(data.answer || 'Lỗi mạng hoặc máy chủ AI.');
      }

      removeTypingIndicator(); // Xóa "..."
      addMessage(data.answer, "ai"); // Hiển thị câu trả lời THẬT

    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      removeTypingIndicator(); 
      addMessage(`Xin lỗi, tôi đang gặp sự cố: ${error.message}`, "ai");
    }
  }

  // 5. HÀM THÊM TIN NHẮN VÀO CỬA SỔ
  function addMessage(message, sender) {
    const messageElement = document.createElement("p");

    if (sender === "user") {
      messageElement.className = "user-message";
    } else {
      messageElement.className = "ai-message";
    }

    messageElement.innerHTML = message.replace(/\n/g, '<br>'); 
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // 6. HÀM HIỂN THỊ "ĐANG GÕ..."
  function showTypingIndicator() {
    // Kiểm tra xem indicator đã tồn tại chưa, nếu có thì không thêm nữa
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
}); // Kết thúc addEventListener("DOMContentLoaded", ...)