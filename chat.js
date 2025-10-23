// File: chat.js (ở thư mục GỐC)
document.addEventListener("DOMContentLoaded", () => {

  const sendButton = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatWindow = document.getElementById("chat-window");

  if (!sendButton || !userInput || !chatWindow) {
      console.error("LỖI Frontend: Không tìm thấy phần tử chat quan trọng. Kiểm tra ID trong index.html!");
      return;
  }

  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  async function sendMessage() {
    let question = userInput.value.trim();
    if (question === "") return;

    addMessage(question, "user");
    userInput.value = "";
    showTypingIndicator();

    try {
      const response = await fetch('/api/gemini-handler', { // Gọi đúng backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question })
      });

      const data = await response.json();

      if (!response.ok) {
        // Ưu tiên hiển thị lỗi cụ thể từ backend nếu có
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

  function addMessage(message, sender) {
    const messageElement = document.createElement("p");
    messageElement.className = sender === "user" ? "user-message" : "ai-message";
     if (sender === 'user') {
        messageElement.textContent = message;
    } else {
         messageElement.innerHTML = message ? message.replace(/\n/g, '<br>') : '[AI không trả lời]'; // Xử lý trường hợp AI trả về rỗng
    }
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function showTypingIndicator() {
    if (document.getElementById("typing-indicator")) return;
    const typingIndicator = document.createElement("p");
    typingIndicator.className = "ai-message typing-indicator";
    typingIndicator.id = "typing-indicator";
    typingIndicator.innerHTML = "<span></span><span></span><span></span>";
    chatWindow.appendChild(typingIndicator);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) {
      chatWindow.removeChild(indicator);
    }
  }
});