// File: chat.js (ở thư mục GỐC)
document.addEventListener("DOMContentLoaded", () => {

    // LẤY LINH KIỆN TỪ HTML
    const sendButton = document.getElementById("send-button");
    const userInput = document.getElementById("user-input");
    const chatWindow = document.getElementById("chat-window");

    // LẤY CÁC NÚT ĐIỀU KHIỂN WIDGET
    const chatWidget = document.getElementById('ai-chat-widget');
    const chatBubble = document.getElementById('ai-chat-bubble');
    const chatBox = document.getElementById('ai-chat-box');
    const closeBtn = document.getElementById('ai-chat-close-btn');

    // Kiểm tra lỗi nếu không tìm thấy phần tử HTML
    if (!sendButton || !userInput || !chatWindow || !chatWidget || !chatBubble || !chatBox || !closeBtn) {
        console.error("LỖI Frontend: Không tìm thấy các phần tử chat quan trọng. Kiểm tra lại ID trong index.html!");
        return;
    }

    // NỐI DÂY ĐIỆN CHO NÚT GỬI, ENTER, BONG BÓNG, NÚT ĐÓNG
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
    chatBubble.addEventListener('click', toggleChatBox);
    closeBtn.addEventListener('click', toggleChatBox);

    // HÀM GỬI TIN NHẮN (GỌI /api/gemini-handler)
    async function sendMessage() {
        let question = userInput.value.trim();
        if (question === "") return;

        addMessage(question, "user");
        userInput.value = "";
        showTypingIndicator();

        try {
            const response = await fetch('/api/gemini-handler', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: question })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Lỗi máy chủ: ${response.status}`);
            }

            removeTypingIndicator();
            addMessage(data.answer, "ai");

        } catch (error) {
            console.error("Lỗi Frontend khi gọi API:", error);
            removeTypingIndicator();
            addMessage(`Xin lỗi, đã xảy ra sự cố: ${error.message}`, "ai");
        }
    }

    // HÀM THÊM TIN NHẮN VÀO CỬA SỔ
    function addMessage(message, sender) {
        const messageElement = document.createElement("p");
        messageElement.className = sender === "user" ? "user-message" : "ai-message";
        if (sender === 'user') {
            messageElement.textContent = message;
        } else {
            messageElement.innerHTML = message ? message.replace(/\n/g, '<br>') : '[AI không trả lời]';
        }
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // HÀM HIỂN THỊ "ĐANG GÕ..."
    function showTypingIndicator() {
        if (document.getElementById("typing-indicator")) return;
        const typingIndicator = document.createElement("p");
        typingIndicator.className = "ai-message typing-indicator";
        typingIndicator.id = "typing-indicator";
        typingIndicator.innerHTML = "<span></span><span></span><span></span>";
        chatWindow.appendChild(typingIndicator);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // HÀM XÓA "ĐANG GÕ..."
    function removeTypingIndicator() {
        const indicator = document.getElementById("typing-indicator");
        if (indicator) {
            chatWindow.removeChild(indicator);
        }
    }

    // HÀM MỞ/ĐÓNG CHATBOX
    function toggleChatBox() {
        // Thêm/Xóa class 'chat-open' trên widget chính
        chatWidget.classList.toggle('chat-open');
        // Tự động focus vào ô nhập khi mở chatbox
        if (chatWidget.classList.contains('chat-open')) {
            // Dùng setTimeout nhỏ để đảm bảo ô input hiện ra trước khi focus
            setTimeout(() => userInput.focus(), 50);
        }
    }

}); // Kết thúc DOMContentLoaded