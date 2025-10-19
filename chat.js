// Chờ cho toàn bộ trang web (HTML) tải xong thì mới chạy code
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Lấy các "linh kiện" từ HTML
    const sendButton = document.getElementById("send-button");
    const userInput = document.getElementById("user-input");
    const chatWindow = document.getElementById("chat-window");

    // 2. Gán hành động "click" cho nút Gửi
    sendButton.addEventListener("click", sendMessage);

    // 3. Gán hành động "nhấn Enter" cho ô nhập liệu
    userInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    // 4. ĐỊNH NGHĨA HÀM "sendMessage" (NÂNG CẤP)
    function sendMessage() {
        let question = userInput.value.trim(); // Lấy text từ ô nhập
        if (question === "") return; // Nếu rỗng thì không làm gì

        // 4.1. Hiển thị câu hỏi của bạn lên màn hình chat
        addMessage(question, "user");
        
        // 4.2. Xóa chữ trong ô nhập
        userInput.value = ""; 
        
        // 4.3. THÊM MỚI: Hiển thị "Đang gõ..."
        showTypingIndicator();
        
        // 4.4. Giả lập AI trả lời
        setTimeout(() => {
            // THÊM MỚI: Xóa "Đang gõ..."
            removeTypingIndicator();

            // Câu trả lời GIẢ LẬP.
            let fakeAiReply = "Tôi đã nhận được câu hỏi: '" + question + "'. Hiện tại tôi chưa thể kết nối với n8n/Gemini, nhưng khi sẵn sàng, tôi sẽ trả lời bạn ở đây!";
            addMessage(fakeAiReply, "ai");
        }, 1500); // Tăng lên 1.5 giây cho "thật" hơn
    }

    // 5. ĐỊNH NGHĨA HÀM "addMessage" (Thêm tin nhắn vào cửa sổ)
    function addMessage(message, sender) {
        const messageElement = document.createElement("p");
        
        if (sender === "user") {
            messageElement.className = "user-message";
        } else {
            messageElement.className = "ai-message";
        }
        
        messageElement.textContent = message;
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // 6. HÀM MỚI: Hiển thị icon "Đang gõ..."
    function showTypingIndicator() {
        const typingIndicator = document.createElement("p");
        typingIndicator.className = "ai-message typing-indicator"; // Dùng chung style ai-message
        typingIndicator.id = "typing-indicator"; // Đặt ID để dễ xóa
        typingIndicator.innerHTML = "<span></span><span></span><span></span>"; // 3 dấu chấm
        chatWindow.appendChild(typingIndicator);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // 7. HÀM MỚI: Xóa icon "Đang gõ..."
    function removeTypingIndicator() {
        const indicator = document.getElementById("typing-indicator");
        if (indicator) {
            chatWindow.removeChild(indicator);
        }
    }
});