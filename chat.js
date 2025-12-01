document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. CẤU HÌNH & BIẾN ---
    const CONFIG = {
        apiEndpoint: '/api/gemini-handler',
        defaultEbook: 'https://www.canva.com/design/DAG1iqLNUEc/rfbuWms06Wuo5RPlkSY0dA/view?embed',
        defaultTitle: 'Ebook và Chatbot AI của Minh Hua'
    };

    // --- 2. DOM ELEMENTS ---
    const dom = {
        iframe: document.getElementById('ebook-frame'),
        ebookTitle: document.getElementById('ebook-title'),
        chatBox: document.getElementById('chat-box'),
        chatToggleBtn: document.getElementById('chat-toggle-btn'),
        chatCloseBtn: document.getElementById('chat-close-btn'),
        chatMessages: document.getElementById('chat-messages'),
        chatInput: document.getElementById('chat-input'),
        sendBtn: document.getElementById('send-btn'),
        micBtn: document.getElementById('mic-btn'),
        links: document.querySelectorAll('a[data-src]'),
        contactLinks: document.querySelectorAll('[id^="contact-link"]'),
        modal: document.getElementById('contact-modal'),
        modalClose: document.querySelector('.close-btn'),
        hamburger: document.getElementById('hamburger-btn'),
        mobileMenu: document.getElementById('mobile-menu-overlay')
    };

    // --- 3. XỬ LÝ ĐIỀU HƯỚNG EBOOK ---
    function loadEbook(url) {
        if (!url) return;
        dom.iframe.src = url;
        
        // Cập nhật tiêu đề footer (tùy chọn logic nâng cao để lấy tên)
        // Ở đây giữ đơn giản
    }

    dom.links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.getAttribute('data-src');
            const title = link.textContent;
            
            loadEbook(url);
            dom.ebookTitle.textContent = `${title} - Minh Hua`;
            
            // Đóng menu mobile nếu đang mở
            if (dom.mobileMenu.classList.contains('active')) {
                dom.mobileMenu.classList.remove('active');
            }
        });
    });

    // --- 4. CHATBOT LOGIC ---
    
    // Mở/Đóng Chat
    function toggleChat() {
        dom.chatBox.classList.toggle('hidden');
        if (!dom.chatBox.classList.contains('hidden')) {
            setTimeout(() => dom.chatInput.focus(), 100); // Focus input khi mở
        }
    }
    dom.chatToggleBtn.addEventListener('click', toggleChat);
    dom.chatCloseBtn.addEventListener('click', toggleChat);

    // Thêm tin nhắn vào giao diện
    function appendMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}-message`;
        // Xử lý xuống dòng cho AI
        div.innerHTML = sender === 'ai' ? text.replace(/\n/g, '<br>') : text;
        dom.chatMessages.appendChild(div);
        dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
    }

    // Hiển thị "Đang gõ..."
    function showTyping() {
        const div = document.createElement('div');
        div.className = 'typing-indicator';
        div.id = 'typing';
        div.textContent = 'AI đang suy nghĩ...';
        dom.chatMessages.appendChild(div);
        dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
    }

    function removeTyping() {
        const typing = document.getElementById('typing');
        if (typing) typing.remove();
    }

    // Gửi tin nhắn đến API
    async function handleSend() {
        const text = dom.chatInput.value.trim();
        if (!text) return;

        // UI cập nhật
        appendMessage(text, 'user');
        dom.chatInput.value = '';
        showTyping();

        try {
            const response = await fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: text })
            });

            const data = await response.json();
            removeTyping();

            if (!response.ok) {
                throw new Error(data.error || 'Lỗi máy chủ');
            }

            appendMessage(data.answer, 'ai');

        } catch (error) {
            console.error("Lỗi Chat:", error);
            removeTyping();
            appendMessage(`Lỗi: ${error.message}. Vui lòng thử lại.`, 'ai');
        }
    }

    dom.sendBtn.addEventListener('click', handleSend);
    dom.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // --- 5. VOICE CHAT (STT Only) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.interimResults = false;

        dom.micBtn.addEventListener('click', () => {
            if (dom.micBtn.classList.contains('listening')) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });

        recognition.onstart = () => {
            dom.micBtn.classList.add('listening');
        };

        recognition.onend = () => {
            dom.micBtn.classList.remove('listening');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            dom.chatInput.value = transcript;
            handleSend(); // Tự động gửi sau khi nói xong
        };

        recognition.onerror = (event) => {
            console.error("Lỗi Mic:", event.error);
            dom.micBtn.classList.remove('listening');
            appendMessage(`(Lỗi Micro: ${event.error})`, 'ai');
        };
    } else {
        console.warn("Trình duyệt không hỗ trợ Web Speech API");
        dom.micBtn.style.display = 'none';
    }

    // --- 6. MODAL LIÊN HỆ ---
    dom.contactLinks.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            dom.modal.classList.add('active');
            // Đóng menu mobile nếu đang mở
            dom.mobileMenu.classList.remove('active');
        });
    });

    dom.modalClose.addEventListener('click', () => {
        dom.modal.classList.remove('active');
    });

    dom.modal.addEventListener('click', (e) => {
        if (e.target === dom.modal) dom.modal.classList.remove('active');
    });

    // --- 7. MOBILE MENU ---
    dom.hamburger.addEventListener('click', () => {
        dom.mobileMenu.classList.toggle('active');
    });

});