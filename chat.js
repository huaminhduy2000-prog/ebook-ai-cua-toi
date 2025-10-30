// File: chat.js (ở thư mục GỐC)
// Code này xử lý TOÀN BỘ tương tác Giao diện (Front-end)

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

    // === KIỂM TRA PHẦN TỬ DOM (Để tránh lỗi nếu HTML thay đổi) ===
    function checkElements(...elements) {
        return elements.every(el => el !== null);
    }
    // Kiểm tra các nhóm tính năng
    const essentialChatElementsExist = checkElements(sendButton, userInput, chatWindow, chatWidget, chatBubble, chatBox, closeChatBtn);
    const dropdownElementsExist = dropdownBtns.length > 0 && canvaIframe && canvaBrandLink;
    const modalElementsExist = checkElements(contactLink, contactModal, closeModalBtn);
    const scrollElementsExist = checkElements(modernEbookSection, chatWidget); // Cần cả 2 để chạy scroll animation

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

    // 4. Scroll Animation Event (Intersection Observer)
    if (scrollElementsExist) {
        const observerOptions = {
            root: null, // Quan sát so với viewport
            rootMargin: '0px',
            threshold: 0.25 // Kích hoạt khi 25% section hiện ra
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Khi cuộn tới Ebook hiện đại
                    if (entry.target.id === 'modern-ebook') {
                        entry.target.classList.add('is-visible');
                        chatWidget.classList.add('is-visible'); // Hiện cả chat bubble
                    }
                } else {
                    // Ẩn lại khi cuộn lên (tùy chọn)
                    if (entry.target.id === 'modern-ebook') {
                        entry.target.classList.remove('is-visible');
                        chatWidget.classList.remove('is-visible');
                    }
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        observer.observe(modernEbookSection); // Bắt đầu quan sát Ebook hiện đại
    }

    // === CÁC HÀM XỬ LÝ (HELPER FUNCTIONS) ===

    // --- Chatbot Functions ---
    async function sendMessage() {
        if (!userInput) return; // Kiểm tra lại
        let question = userInput.value.trim();
        if (question === "") return;
        addMessage(question, "user");
        userInput.value = "";
        showTypingIndicator();
        try {
            // Gọi Backend Gemini
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
            if (canvaBrandLink) {
                 try {
                     let designId = new URLSearchParams(new URL(newUrl).search).get('designId');
                     if (!designId) {
                         const pathParts = new URL(newUrl).pathname.split('/');
                         if (pathParts[1] === 'design' && pathParts[2]) {
                            designId = pathParts[2];
                         }
                     }
                     if (designId) {
                         canvaBrandLink.href = `https://www.canva.com/design/${designId}/view?utm_content=${designId}&utm_campaign=designshare&utm_medium=embeds&utm_source=link`;
                         canvaBrandLink.textContent = `${newText || 'Thiết kế'} của Minh Hua trên Canva`;
                     } else {
                          canvaBrandLink.textContent = `Thiết kế của Minh Hua trên Canva`;
                          canvaBrandLink.href = "#";
                     }
                 } catch(e) {
                     console.error("Không thể phân tích URL Canva hoặc cập nhật link branding:", e);
                      canvaBrandLink.textContent = `Thiết kế của Minh Hua trên Canva`;
                      canvaBrandLink.href = "#";
                 }
            }
        } else {
            console.warn("URL Canva không hợp lệ hoặc iframe không tồn tại:", newUrl);
        }
    }

}); // Kết thúc DOMContentLoaded