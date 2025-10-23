// File: chat.js (ở thư mục GỐC)
document.addEventListener("DOMContentLoaded", () => {

    // === LẤY CÁC PHẦN TỬ DOM ===
    // Chatbot Elements
    const sendButton = document.getElementById("send-button");
    const userInput = document.getElementById("user-input");
    const chatWindow = document.getElementById("chat-window");
    const chatWidget = document.getElementById('ai-chat-widget');
    const chatBubble = document.getElementById('ai-chat-bubble');
    const chatBox = document.getElementById('ai-chat-box');
    const closeChatBtn = document.getElementById('ai-chat-close-btn');
    // Dropdown Elements
    const dropdownBtns = document.querySelectorAll('.main-nav .dropbtn');
    const canvaIframe = document.querySelector('.canva-iframe-fix');
    const canvaBrandLink = document.querySelector('.canva-brand-link');
    // Modal Elements
    const contactLink = document.getElementById('contact-link');
    const contactModal = document.getElementById('contact-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // === KIỂM TRA PHẦN TỬ DOM (Để tránh lỗi nếu HTML thay đổi) ===
    function checkElements(...elements) {
        return elements.every(el => el !== null);
    }
    const essentialChatElementsExist = checkElements(sendButton, userInput, chatWindow, chatWidget, chatBubble, chatBox, closeChatBtn);
    const dropdownElementsExist = dropdownBtns.length > 0 && canvaIframe && canvaBrandLink;
    const modalElementsExist = checkElements(contactLink, contactModal, closeModalBtn);

    // === GẮN SỰ KIỆN (EVENT LISTENERS) ===

    // 1. Chatbot Events
    if (essentialChatElementsExist) {
        sendButton.addEventListener("click", sendMessage);
        userInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") { event.preventDefault(); sendMessage(); }
        });
        chatBubble.addEventListener('click', toggleChatBox);
        closeChatBtn.addEventListener('click', toggleChatBox);
    } else {
        console.error("LỖI Frontend: Thiếu phần tử chat quan trọng.");
    }

    // 2. Dropdown Menu Events
    if (dropdownElementsExist) {
        dropdownBtns.forEach(btn => {
            btn.addEventListener('click', function(event) {
                event.stopPropagation();
                const content = this.nextElementSibling;
                const parentDropdown = this.parentElement;
                const isOpen = content.classList.contains('show');
                closeAllDropdowns(); // Luôn đóng cái khác trước
                if (!isOpen) { // Chỉ mở nếu nó đang đóng
                    content.classList.add('show');
                    parentDropdown.classList.add('open');
                }
            });
        });
        document.querySelectorAll('.main-nav .dropdown-content a').forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const newUrl = this.getAttribute('data-content-url');
                const newText = this.textContent;
                loadCanvaContent(newUrl, newText);
                closeAllDropdowns();
            });
        });
        // Đóng dropdown khi click ra ngoài
        window.addEventListener('click', (event) => {
             if (!event.target.matches('.main-nav .dropbtn, .main-nav .dropbtn *')) { // Kiểm tra cả phần tử con
                closeAllDropdowns();
            }
        });
    } else {
        console.warn("CẢNH BÁO: Thiếu phần tử dropdown hoặc iframe.");
    }

    // 3. Contact Modal Events
    if (modalElementsExist) {
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
         // Đóng modal bằng phím Escape
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && contactModal.classList.contains('show')) {
                 contactModal.classList.remove('show');
            }
        });
    } else {
        console.warn("CẢNH BÁO: Thiếu phần tử modal liên hệ.");
    }

    // === CÁC HÀM XỬ LÝ ===

    // --- Chatbot Functions ---
    async function sendMessage() {
        if (!userInput || !essentialChatElementsExist) return; // Kiểm tra lại
        let question = userInput.value.trim();
        if (question === "") return;
        addMessage(question, "user");
        userInput.value = "";
        showTypingIndicator();
        try {
            const response = await fetch('/api/gemini-handler', { // Endpoint backend Gemini
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
    function addMessage(message, sender) {
        if (!chatWindow) return;
        const messageElement = document.createElement("p");
        messageElement.className = sender === "user" ? "user-message" : "ai-message";
        if (sender === 'user') { messageElement.textContent = message; }
        else { messageElement.innerHTML = message ? message.replace(/\n/g, '<br>') : '[AI không trả lời]'; }
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
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
    function toggleChatBox() {
        if (!chatWidget) return;
        const isOpen = chatWidget.classList.toggle('chat-open');
        if (isOpen) {
            // Đảm bảo chatbox thực sự hiện ra trước khi focus
            requestAnimationFrame(() => {
                 setTimeout(() => userInput.focus(), 0);
            });
        }
    }

    // --- Dropdown Functions ---
    function closeAllDropdowns(exceptThisOne = null) {
        document.querySelectorAll('.main-nav .dropdown-content.show').forEach(openDropdown => {
            if (openDropdown !== exceptThisOne) {
                openDropdown.classList.remove('show');
                const parentDropdown = openDropdown.closest('.dropdown');
                if (parentDropdown) parentDropdown.classList.remove('open');
            }
        });
    }
    function loadCanvaContent(newUrl, newText) {
         if (canvaIframe && newUrl && newUrl !== '#') {
            console.log("Đang tải Canva:", newUrl);
            canvaIframe.src = newUrl; // Thay đổi link src của iframe

            // Cập nhật link branding (tùy chọn)
            if (canvaBrandLink) {
                 try {
                     // Cố gắng trích xuất ID thiết kế từ URL embed mới
                     // Cách 1: Tìm trong query param (ít tin cậy hơn)
                     let designId = new URLSearchParams(new URL(newUrl).search).get('designId');
                     // Cách 2: Tìm trong path (tin cậy hơn)
                     if (!designId) {
                         const pathParts = new URL(newUrl).pathname.split('/');
                         // ID thường là phần tử thứ 3 (index 2) sau /design/
                         if (pathParts[1] === 'design' && pathParts[2]) {
                            designId = pathParts[2];
                         }
                     }

                     if (designId) {
                         canvaBrandLink.href = `https://www.canva.com/design/${designId}/view?utm_content=${designId}&utm_campaign=designshare&utm_medium=embeds&utm_source=link`;
                         canvaBrandLink.textContent = `${newText || 'Thiết kế'} của Minh Hua trên Canva`;
                     } else {
                         // Nếu không tìm được ID, ẩn hoặc giữ nguyên link cũ
                          canvaBrandLink.textContent = `Thiết kế của Minh Hua trên Canva`;
                          canvaBrandLink.href = "#"; // Hoặc ẩn đi: canvaBrandLink.style.display = 'none';
                     }
                 } catch(e) {
                     console.error("Không thể phân tích URL Canva hoặc cập nhật link branding:", e);
                      // Giữ nguyên link cũ hoặc ẩn đi
                      canvaBrandLink.textContent = `Thiết kế của Minh Hua trên Canva`;
                      canvaBrandLink.href = "#";
                 }
            }
        } else {
            console.warn("URL Canva không hợp lệ hoặc iframe không tồn tại:", newUrl);
        }
    }

}); // Kết thúc DOMContentLoaded