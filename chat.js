// File: chat.js (ở thư mục GỐC)
document.addEventListener("DOMContentLoaded", () => {

    // === PHẦN CHATBOT ===
    const sendButton = document.getElementById("send-button");
    const userInput = document.getElementById("user-input");
    const chatWindow = document.getElementById("chat-window");
    const chatWidget = document.getElementById('ai-chat-widget');
    const chatBubble = document.getElementById('ai-chat-bubble');
    const chatBox = document.getElementById('ai-chat-box');
    const closeChatBtn = document.getElementById('ai-chat-close-btn');

    // Kiểm tra lỗi nếu không tìm thấy phần tử chat
    if (!sendButton || !userInput || !chatWindow || !chatWidget || !chatBubble || !chatBox || !closeChatBtn) {
        console.error("LỖI Frontend: Không tìm thấy các phần tử chat quan trọng.");
    } else {
        // NỐI DÂY ĐIỆN CHO CHATBOT
        sendButton.addEventListener("click", sendMessage);
        userInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") { event.preventDefault(); sendMessage(); }
        });
        chatBubble.addEventListener('click', toggleChatBox);
        closeChatBtn.addEventListener('click', toggleChatBox);
    }

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
            if (!response.ok) { throw new Error(data.error || `Lỗi máy chủ: ${response.status}`); }
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
        if (!chatWindow) return;
        const messageElement = document.createElement("p");
        messageElement.className = sender === "user" ? "user-message" : "ai-message";
        if (sender === 'user') { messageElement.textContent = message; }
        else { messageElement.innerHTML = message ? message.replace(/\n/g, '<br>') : '[AI không trả lời]'; }
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    // HÀM HIỂN THỊ/XÓA "ĐANG GÕ..."
    function showTypingIndicator() {
        if (document.getElementById("typing-indicator") || !chatWindow) return;
        const typingIndicator = document.createElement("p");
        typingIndicator.className = "ai-message typing-indicator";
        typingIndicator.id = "typing-indicator";
        typingIndicator.innerHTML = "<span></span><span></span><span></span>";
        chatWindow.appendChild(typingIndicator);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    function removeTypingIndicator() {
        const indicator = document.getElementById("typing-indicator");
        if (indicator && chatWindow) { chatWindow.removeChild(indicator); }
    }
    // HÀM MỞ/ĐÓNG CHATBOX
    function toggleChatBox() {
        if (!chatWidget) return;
        chatWidget.classList.toggle('chat-open');
        if (chatWidget.classList.contains('chat-open')) {
            setTimeout(() => userInput.focus(), 50);
        }
    }

    // === PHẦN DROPDOWN MENU ===
    const dropdownBtns = document.querySelectorAll('.main-nav .dropbtn');
    const canvaIframe = document.querySelector('.canva-iframe-fix');
    const canvaBrandLink = document.querySelector('.canva-brand-link');

    if (dropdownBtns.length > 0 && canvaIframe && canvaBrandLink) {
        // Sự kiện click cho nút dropdown
        dropdownBtns.forEach(btn => {
            btn.addEventListener('click', function(event) {
                event.stopPropagation();
                const content = this.nextElementSibling;
                closeAllDropdowns(content);
                content.classList.toggle('show');
                this.parentElement.classList.toggle('open');
            });
        });
        // Sự kiện click cho link trong dropdown
        document.querySelectorAll('.main-nav .dropdown-content a').forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const newUrl = this.getAttribute('data-content-url');
                const newText = this.textContent;
                if (canvaIframe && newUrl) {
                    console.log("Đang tải:", newUrl);
                    canvaIframe.src = newUrl;
                }
                if (canvaBrandLink && newUrl) {
                    try {
                        const urlParams = new URLSearchParams(new URL(newUrl).search);
                        const designId = urlParams.get('designId') || new URL(newUrl).pathname.split('/')[2];
                        if (designId) {
                            canvaBrandLink.href = `https://www.canva.com/design/${designId}/view?utm_content=${designId}&utm_campaign=designshare&utm_medium=embeds&utm_source=link`;
                            canvaBrandLink.textContent = `${newText} của Minh Hua`;
                        }
                    } catch(e) { console.error("Không thể cập nhật link branding:", e); }
                }
                closeAllDropdowns();
            });
        });
        // Đóng dropdown khi click ra ngoài
        window.addEventListener('click', function(event) {
            if (!event.target.matches('.main-nav .dropbtn')) {
                closeAllDropdowns();
            }
        });
    }
    // Hàm đóng dropdown
    function closeAllDropdowns(exceptThisOne = null) {
        document.querySelectorAll('.main-nav .dropdown-content.show').forEach(openDropdown => {
            if (openDropdown !== exceptThisOne) {
                openDropdown.classList.remove('show');
                if (openDropdown.previousElementSibling?.parentElement) {
                     openDropdown.previousElementSibling.parentElement.classList.remove('open');
                }
            }
        });
    }

    // === PHẦN MODAL LIÊN HỆ ===
    const contactLink = document.getElementById('contact-link');
    const contactModal = document.getElementById('contact-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    if (contactLink && contactModal && closeModalBtn) {
        contactLink.addEventListener('click', (event) => {
            event.preventDefault();
            contactModal.classList.add('show');
        });
        closeModalBtn.addEventListener('click', () => {
            contactModal.classList.remove('show');
        });
        contactModal.addEventListener('click', (event) => {
            if (event.target === contactModal) {
                contactModal.classList.remove('show');
            }
        });
    } else {
        console.warn("CẢNH BÁO: Không tìm thấy các phần tử modal liên hệ.");
    }

}); // Kết thúc DOMContentLoaded