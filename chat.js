// File: chat.js (in the ROOT directory)
// Runs in the user's browser

document.addEventListener("DOMContentLoaded", () => {

  const sendButton = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatWindow = document.getElementById("chat-window");

  if (!sendButton || !userInput || !chatWindow) {
      console.error("ERROR: Could not find essential chat elements (button, input, or window). Check IDs in index.html!");
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
      // Call the backend function located at /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question }) 
      });

      const data = await response.json(); 

      if (!response.ok) {
        // Display error message from the backend if available
        throw new Error(data.answer || data.error || 'Network or AI server error.');
      }

      removeTypingIndicator(); 
      addMessage(data.answer, "ai"); // Display the REAL AI answer

    } catch (error) {
      console.error("Error calling API:", error);
      removeTypingIndicator(); 
      addMessage(`Sorry, I encountered an issue: ${error.message}`, "ai");
    }
  }

  function addMessage(message, sender) {
    const messageElement = document.createElement("p");
    messageElement.className = sender === "user" ? "user-message" : "ai-message";
    // Use textContent for user messages, allow basic HTML for AI (like line breaks)
    if (sender === 'user') {
        messageElement.textContent = message;
    } else {
         messageElement.innerHTML = message.replace(/\n/g, '<br>'); // Handle potential line breaks
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