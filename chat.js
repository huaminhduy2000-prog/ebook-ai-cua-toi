// File: chat.js (in the ROOT directory)
// Runs in the user's browser

document.addEventListener("DOMContentLoaded", () => {

  const sendButton = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatWindow = document.getElementById("chat-window");

  // Error checking: Ensure HTML elements exist
  if (!sendButton || !userInput || !chatWindow) {
      console.error("ERROR: Could not find essential chat elements (button, input, or window). Check IDs in index.html!");
      return;
  }

  // Attach event listener for the Send button click
  sendButton.addEventListener("click", sendMessage);
  // Attach event listener for the Enter key press in the input field
  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default Enter behavior (like adding a new line)
      sendMessage();
    }
  });

  // Function to handle sending the message
  async function sendMessage() {
    let question = userInput.value.trim();
    if (question === "") return; // Don't send empty messages

    addMessage(question, "user"); // Display user's message
    userInput.value = ""; // Clear the input field
    showTypingIndicator(); // Show the "..." indicator

    try {
      // Call the backend API endpoint (RENAMED)
      const response = await fetch('/api/handle-chat', { // <-- Calls the renamed endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question }) // Send {"question": "..."}
      });

      const data = await response.json(); // Get back {"answer": "..."} or {"error": "..."}

      // Handle potential errors returned by the backend
      if (!response.ok) {
        throw new Error(data.answer || data.error || 'Network or AI server error.');
      }

      removeTypingIndicator(); // Remove the "..." indicator
      addMessage(data.answer, "ai"); // Display the REAL AI answer

    } catch (error) {
      console.error("Error calling API:", error);
      removeTypingIndicator(); // Still remove indicator if there's an error
      // Display the error message in the chat window
      addMessage(`Sorry, I encountered an issue: ${error.message}`, "ai");
    }
  }

  // Function to add a message bubble to the chat window
  function addMessage(message, sender) {
    const messageElement = document.createElement("p");
    messageElement.className = sender === "user" ? "user-message" : "ai-message";
    // Use textContent for user messages (safer)
    // Use innerHTML for AI messages to handle line breaks (\n -> <br>)
    if (sender === 'user') {
        messageElement.textContent = message;
    } else {
         messageElement.innerHTML = message.replace(/\n/g, '<br>');
    }
    chatWindow.appendChild(messageElement);
    // Automatically scroll to the latest message
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // Function to display the typing indicator
  function showTypingIndicator() {
    // Only add if it doesn't already exist
    if (document.getElementById("typing-indicator")) return;
    const typingIndicator = document.createElement("p");
    typingIndicator.className = "ai-message typing-indicator";
    typingIndicator.id = "typing-indicator";
    typingIndicator.innerHTML = "<span></span><span></span><span></span>";
    chatWindow.appendChild(typingIndicator);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // Function to remove the typing indicator
  function removeTypingIndicator() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) {
      chatWindow.removeChild(indicator);
    }
  }
}); // End DOMContentLoaded