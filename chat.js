// File: chat.js (ở thư mục GỐC) - Hoàn chỉnh với Voice Chat
document.addEventListener("DOMContentLoaded", () => {

    // === LẤY CÁC PHẦN TỬ DOM ===
    // Chatbot
    const sendButton = document.getElementById("send-button");
    const userInput = document.getElementById("user-input");
    const chatWindow = document.getElementById("chat-window");
    const chatWidget = document.getElementById('ai-chat-widget');
    const chatBubble = document.getElementById('ai-chat-bubble');
    const chatBox = document.getElementById('ai-chat-box');
    const closeChatBtn = document.getElementById('ai-chat-close-btn');
    const micButton = document.getElementById("mic-button"); // Nút micro mới
    // Dropdown
    const dropdownBtns = document.querySelectorAll('.main-nav .dropbtn');
    const canvaIframe = document.querySelector('.canva-iframe-fix');
    const canvaBrandLink = document.querySelector('.canva-brand-link');
    // Modal
    const contactLink = document.getElementById('contact-link');
    const contactModal = document.getElementById('contact-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    // Scroll Animation
    const modernEbookSection = document.getElementById('modern-ebook');

    // === KIỂM TRA TÍNH NĂNG VOICE CHAT ===
    // 1. Kiểm tra Speech-to-Text (Nhận dạng giọng nói)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null; // Khởi tạo là null
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.interimResults = false;
    } else {
        console.warn("Trình duyệt không hỗ trợ SpeechRecognition (STT).");
        if(micButton) micButton.style.display = 'none'; // Ẩn nút micro nếu không hỗ trợ
    }
    // 2. Kiểm tra Text-to-Speech (Đọc văn bản)
    const synthesis = window.speechSynthesis;
    if (!synthesis) {
        console.warn("Trình duyệt không hỗ trợ SpeechSynthesis (TTS).");
    }
    // Biến để kiểm tra trạng thái ghi âm
    let isRecording = false;

    // === KIỂM TRA CÁC PHẦN TỬ DOM KHÁC ===
    function checkElements(...elements) { return elements.every(el => el !== null); }
    const essentialChatElementsExist = checkElements(sendButton, userInput, chatWindow, chatWidget, chatBubble, chatBox, closeChatBtn, micButton); // Thêm micButton
    const dropdownElementsExist = dropdownBtns.length > 0 && canvaIframe && canvaBrandLink;
    const modalElementsExist = checkElements(contactLink, contactModal, closeModalBtn);
    const scrollElementsExist = checkElements(modernEbookSection, chatWidget);

    // === GẮN SỰ KIỆN (EVENT LISTENERS) ===

    // 1. Chatbot Events
    if (essentialChatElementsExist) {
        sendButton.addEventListener("click", sendMessage);
        userInput.addEventListener("keypress", (event) => { if (event.key === "Enter") { event.preventDefault(); sendMessage(); } });
        chatBubble.addEventListener('click', toggleChatBox);
        closeChatBtn.addEventListener('click', toggleChatBox);

        // Nối dây điện cho Nút Micro (chỉ khi trình duyệt hỗ trợ)
        if (micButton && recognition) {
            micButton.addEventListener("click", () => {
                if (isRecording) {
                    recognition.stop();
                } else {
                    try {
                        recognition.start();
                    } catch (error) {
                        // Thường lỗi nếu đang có phiên ghi âm khác chạy
                        console.error("Lỗi khi bắt đầu ghi âm:", error);
                        addMessage("Không thể bắt đầu ghi âm. Vui lòng thử lại.", "ai");
                        isRecording = false; // Đặt lại trạng thái
                        micButton.classList.remove("is-recording");
                        micButton.textContent = '🎙️';
                    }
                }
            });

            // Sự kiện khi bắt đầu ghi âm
            recognition.onstart = () => {
                isRecording = true;
                micButton.classList.add("is-recording");
                micButton.textContent = '...'; // Biểu thị đang nghe
            };

            // Sự kiện khi có kết quả
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                // Tự động gửi tin nhắn sau khi nhận dạng xong
                // Dùng setTimeout nhỏ để đảm bảo ô input cập nhật trước khi gửi
                setTimeout(sendMessage, 50);
            };

            // Sự kiện khi kết thúc ghi âm (luôn chạy, cả khi lỗi hoặc dừng)
            recognition.onend = () => {
                isRecording = false;
                micButton.classList.remove("is-recording");
                micButton.textContent = '🎙️'; // Trả lại icon micro
            };

            // Sự kiện khi có lỗi
            recognition.onerror = (event) => {
                console.error("Lỗi SpeechRecognition:", event.error);
                let errorMessage = event.error;
                if (event.error === 'not-allowed') {
                    errorMessage = "Bạn chưa cấp quyền sử dụng micro.";
                } else if (event.error === 'no-speech') {
                    errorMessage = "Không nghe thấy giọng nói.";
                }
                addMessage(`Lỗi giọng nói: ${errorMessage}`, "ai");
                isRecording = false; // Đảm bảo đặt lại trạng thái
            };
        }

    } else {
        console.error("LỖI Frontend: Thiếu phần tử chat quan trọng.");
    }

    // (Code gắn sự kiện cho Dropdown và Modal giữ nguyên như cũ)
    // ...

    // === CÁC HÀM XỬ LÝ (HELPER FUNCTIONS) ===

    // --- Chatbot Functions ---
    async function sendMessage() { /* ... Giữ nguyên code hàm ... */ }
    // HÀM THÊM TIN NHẮN (ĐÃ CÓ TTS)
    function addMessage(message, sender) {
        if (!chatWindow) return;
        const messageElement = document.createElement("p");
        messageElement.className = sender === "user" ? "user-message" : "ai-message";
        let textContentForTTS = message; // Lưu lại text gốc để đọc

        if (sender === 'user') {
            messageElement.textContent = message;
        } else {
            messageElement.innerHTML = message ? message.replace(/\n/g, '<br>') : '[AI không trả lời]';
            // Lấy text content đã xử lý <br> để đọc cho đúng
            textContentForTTS = messageElement.textContent;
        }
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // THÊM MỚI: ĐỌC TIN NHẮN CỦA AI
        if (sender === 'ai' && synthesis && textContentForTTS) {
            try {
                // Dừng giọng nói cũ (nếu có)
                if (synthesis.speaking) {
                    synthesis.cancel();
                }
                const utterance = new SpeechSynthesisUtterance(textContentForTTS);
                utterance.lang = 'vi-VN'; // Ngôn ngữ đọc
                // utterance.rate = 1; // Tốc độ đọc (mặc định 1)
                // utterance.pitch = 1; // Cao độ (mặc định 1)

                // Tìm giọng đọc tiếng Việt (tùy chọn, vì không phải trình duyệt nào cũng có)
                const voices = synthesis.getVoices();
                const vietnameseVoice = voices.find(v => v.lang === 'vi-VN');
                if (vietnameseVoice) {
                    utterance.voice = vietnameseVoice;
                } else {
                    console.warn("Không tìm thấy giọng đọc tiếng Việt.");
                }

                synthesis.speak(utterance);
            } catch (ttsError) {
                console.error("Lỗi Text-to-Speech:", ttsError);
            }
        }
    }
    function showTypingIndicator() { /* ... Giữ nguyên code hàm ... */ }
    function removeTypingIndicator() { /* ... Giữ nguyên code hàm ... */ }
    function toggleChatBox() { /* ... Giữ nguyên code hàm ... */ }

    // --- Dropdown Functions ---
    function closeAllDropdowns(exceptThisOne = null) { /* ... Giữ nguyên code hàm ... */ }
    function loadCanvaContent(newUrl, newText) { /* ... Giữ nguyên code hàm ... */ }

    // --- Modal Function (Không liên quan, giữ nguyên) ---

    // --- Scroll Animation Function (Không liên quan, giữ nguyên) ---

}); // Kết thúc DOMContentLoaded
