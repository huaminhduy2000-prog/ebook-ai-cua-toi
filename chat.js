// File: chat.js (ở thư mục GỐC) - Bản ổn định
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
    const micButton = document.getElementById("mic-button");
    // Dropdown
    const dropdownBtns = document.querySelectorAll('.main-nav .dropbtn');
    const canvaIframe = document.querySelector('.canva-iframe-fix');
    const canvaBrandLink = document.querySelector('.canva-brand-link');
    // Modal
    const contactLink = document.getElementById('contact-link');
    const contactModal = document.getElementById('contact-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    // Hamburger
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const contactLinkMobile = document.getElementById('contact-link-mobile');

    // === KIỂM TRA TÍNH NĂNG VOICE CHAT ===
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isRecording = false;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.interimResults = false;
    } else {
        console.warn("Trình duyệt không hỗ trợ SpeechRecognition (STT).");
        if(micButton) micButton.style.display = 'none';
    }

    // === KIỂM TRA DOM ===
    function checkElements(...elements) { return elements.every(el => el !== null); }
    const essentialChatElementsExist = checkElements(sendButton, userInput, chatWindow, chatWidget, chatBubble, chatBox, closeChatBtn, micButton);
    const dropdownElementsExist = dropdownBtns.length > 0 && canvaIframe && canvaBrandLink;
    const modalElementsExist = checkElements(contactLink, contactModal, closeModalBtn);
    const hamburgerElementsExist = checkElements(hamburgerBtn, mobileNav, mobileNavLinks, contactLinkMobile);

    // === GẮN SỰ KIỆN ===

    // 1. Chatbot
    if (essentialChatElementsExist) {
        sendButton.addEventListener("click", sendMessage);
        userInput.addEventListener("keypress", (event) => { if (event.key === "Enter") { event.preventDefault(); sendMessage(); } });
        chatBubble.addEventListener('click', toggleChatBox);
        closeChatBtn.addEventListener('click', toggleChatBox);

        if (micButton && recognition) {
            micButton.addEventListener("click", () => {
                if (isRecording) {
                    recognition.stop();
                } else {
                    try { recognition.start(); }
                    catch (error) {
                        console.error("Lỗi ghi âm:", error);
                        isRecording = false; micButton.classList.remove("is-recording"); micButton.textContent = '🎙️';
                    }
                }
            });
            recognition.onstart = () => { isRecording = true; micButton.classList.add("is-recording"); micButton.textContent = '...'; };
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                setTimeout(sendMessage, 50);
            };
            recognition.onend = () => { isRecording = false; micButton.classList.remove("is-recording"); micButton.textContent = '🎙️'; };
            recognition.onerror = (event) => { console.error("Lỗi STT:", event.error); isRecording = false; };
        }
    }

    // 2. Dropdown
    if (dropdownElementsExist) {
        dropdownBtns.forEach(btn => {
            btn.addEventListener('click', function(event) {
                event.stopPropagation();
                const content = this.nextElementSibling;
                const parentDropdown = this.parentElement;
                const isOpen = content.classList.contains('show');
                closeAllDropdowns();
                if (!isOpen) { content.classList.add('show'); parentDropdown.classList.add('open'); }
            });
        });
        document.querySelectorAll('.main-nav .dropdown-content a').forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                loadCanvaContent(this.getAttribute('data-content-url'), this.textContent);
                closeAllDropdowns();
            });
        });
        window.addEventListener('click', (event) => { if (!event.target.matches('.main-nav .dropbtn, .main-nav .dropbtn *')) { closeAllDropdowns(); } });
    }

    // 3. Modal
    if (modalElementsExist) {
        contactLink.addEventListener('click', (event) => { event.preventDefault(); contactModal.classList.add('show'); });
        closeModalBtn.addEventListener('click', () => { contactModal.classList.remove('show'); });
        contactModal.addEventListener('click', (event) => { if (event.target === contactModal) { contactModal.classList.remove('show'); } });
    }

    // 4. Hamburger
    if (hamburgerElementsExist) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('is-active');
            mobileNav.classList.toggle('is-active');
        });
        mobileNavLinks.forEach(link => {
            if (link.hasAttribute('data-content-url')) {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    loadCanvaContent(this.getAttribute('data-content-url'), this.textContent);
                    hamburgerBtn.classList.remove('is-active'); mobileNav.classList.remove('is-active');
                });
            }
        });
        if (contactLinkMobile && contactModal) {
             contactLinkMobile.addEventListener('click', (event) => {
                event.preventDefault(); contactModal.classList.add('show');
                hamburgerBtn.classList.remove('is-active'); mobileNav.classList.remove('is-active');
            });
        }
    }

    // === HÀM XỬ LÝ ===
    async function sendMessage() {
        if (!userInput) return;
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
            if (!response.ok) { throw new Error(data.error || `Lỗi: ${response.status}`); }
            removeTypingIndicator();
            addMessage(data.answer, "ai");
        } catch (error) {
            console.error("Lỗi API:", error);
            removeTypingIndicator();
            addMessage(`Lỗi: ${error.message}`, "ai");
        }
    }

    function addMessage(message, sender) {
        if (!chatWindow) return;
        const messageElement = document.createElement("p");
        messageElement.className = sender === "user" ? "user-message" : "ai-message";
        if (sender === 'user') { messageElement.textContent = message; }
        else { messageElement.innerHTML = message ? message.replace(/\n/g, '<br>') : '...'; }
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
        if (isOpen) { requestAnimationFrame(() => { setTimeout(() => userInput.focus(), 50); }); }
    }
    function closeAllDropdowns() {
        document.querySelectorAll('.main-nav .dropdown-content.show').forEach(open => {
            open.classList.remove('show');
            open.closest('.dropdown')?.classList.remove('open');
        });
    }
    function loadCanvaContent(newUrl, newText) {
         if (canvaIframe && newUrl) {
            canvaIframe.src = newUrl;
            if (canvaBrandLink) {
                canvaBrandLink.textContent = `${newText} - Minh Hua`;
                canvaBrandLink.href = "#";
            }
        }
    }
});