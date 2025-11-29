export function MessageChat() {
    const ContainerMessageChat = document.querySelector('.message_chat');
    
    if (!ContainerMessageChat) {
        console.warn('Message chat container not found');
        return;
    }

    const config = {
        socketUrl: 'http://localhost:3000',
        selectors: {
            chatWindow: '#chatWindow',
            chatMessages: '#chatMessages', 
            messageInput: '#messageInput',
            typingIndicator: '#typing',
            sendButton: '#sendButton'
        }
    };

    let isOpen = false;
    let lastScroll = 0;
    let typingTimer;
    let socket;
    let chatElement;

    function init() {
        renderHTML();
        setupEventListeners();
        initSocket();
        setupScrollBehavior();
        setupResponsiveButton();
        setupMobileInputBehavior(); // — MOBILE FIX: add listeners for mobile textarea + visualViewport handling
        
        window.toggleChat = toggleChat;
        window.sendMessage = sendMessage;
    }

    function renderHTML() {
        const isMobile = window.innerWidth <= 540;

        const mobileInput = isMobile ? `
            <div class="mobile-native-input">
                <textarea id="mobileMessageInput" placeholder="Напишите сообщение..." rows="1"></textarea>
                <button onclick="sendMessage()" class="mobile-send-btn">Send</button>
            </div>
        ` : '';

        const MessageChatHtml = `
            <div class="message_chat_container stroke_main">
                <div onclick="toggleChat()" class="message_chat_content">
                    <div class="openchat">
                        <img src="./src/assests/svg/chat.svg" alt="чат">
                        <h4>Чат с менеджером</h4>
                    </div>
                </div>
                <a href="tel:+77778889900">
                    <button class="phonecall"><img src="./src/assests/svg/phone.svg" alt="телефон"></button>
                </a>
            </div>

            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <strong>Чат с менеджером</strong>
                    <button class="close-btn" onclick="toggleChat()">×</button>
                </div>
                <div class="chat-messages" id="chatMessages"></div>

                <!-- Десктопный инпут (скрыт на мобилке) -->
                <div class="chat-input desktop-only">
                    <input type="text" id="messageInput" placeholder="Напишите сообщение..." autocomplete="off">
                    <button id="sendButton" onclick="sendMessage()">Отправить</button>
                </div>

                <!-- Мобильный нативный инпут (показывается только на мобилке) -->
                ${mobileInput}
            </div>
        `;
        ContainerMessageChat.innerHTML = MessageChatHtml;
        
        chatElement = ContainerMessageChat.querySelector('.message_chat_container');
    }

    function setupEventListeners() {
        const messageInput = document.getElementById(config.selectors.messageInput.slice(1));
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                    e.preventDefault();
                }
            });

            messageInput.addEventListener('input', handleTyping);
        }

        // Поддержка мобильного textarea: Enter без Shift отправляет (опционально),
        // но мы оставляем перенос строки при Shift+Enter.
        const mobileTextarea = document.getElementById('mobileMessageInput');
        if (mobileTextarea) {
            mobileTextarea.addEventListener('keydown', (e) => {
                // если хотим, чтобы Enter отправлял (обычно в мессенджерах) — используем:
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            mobileTextarea.addEventListener('input', handleTyping);
        }

        window.addEventListener('resize', setupResponsiveButton);

        document.addEventListener('click', (e) => {
            const chatWindow = document.querySelector(config.selectors.chatWindow);
            const chatContainer = document.querySelector('.message_chat_container');
            
            if (isOpen && 
                chatWindow && !chatWindow.contains(e.target) && 
                chatContainer && !chatContainer.contains(e.target)) {
                toggleChat();
            }
        });
    }

    function setupResponsiveButton() {
        const sendButton = document.getElementById(config.selectors.sendButton.slice(1));
        if (!sendButton) return;

        if (window.innerWidth <= 540) {
            sendButton.style.display = 'none';
        } else {
            sendButton.style.display = 'block';
        }
    }

    function isMobileDevice() {
        return window.innerWidth <= 540;
    }

    function initSocket() {
        try {
            socket = io(config.socketUrl);

            let clientId = localStorage.getItem('chatClientId');
            if (!clientId) {
                clientId = 'cid_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
                localStorage.setItem('chatClientId', clientId);
            }

            socket.on('connect', () => {
                socket.emit('identify', clientId);
            });

            socket.on('manager_message', (text) => {
                addMessage(text, 'manager');
                removeTypingIndicator();
            });

            socket.on('typing', (isTyping) => {
                if (isTyping) {
                    showTypingIndicator();
                } else {
                    removeTypingIndicator();
                }
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });

        } catch (error) {
            console.error('Socket initialization error:', error);
        }
    }

    function setupScrollBehavior() {
        if (!chatElement) return;

        window.addEventListener('scroll', function() {
            // Если чат открыт - не трогаем кнопку
            if (isOpen) return;

            const currentScroll = window.scrollY;
            
            if (currentScroll > lastScroll && currentScroll > 100) {
                chatElement.style.transform = 'translateX(-50%) translateY(100px)';
                chatElement.style.opacity = '0';
            } else {
                chatElement.style.transform = 'translateX(-50%) translateY(0)';
                chatElement.style.opacity = '1';
            }
            
            lastScroll = currentScroll;
        });
    }


    function toggleChat() {
        const chatWindow = document.getElementById(config.selectors.chatWindow.slice(1));
        if (!chatWindow) return;

        isOpen = !isOpen;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
        
        if (isOpen) {
            const messageInput = document.getElementById(config.selectors.messageInput.slice(1));
            const chatMessages = document.getElementById(config.selectors.chatMessages.slice(1));
            
            if (messageInput) messageInput.focus();
            if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;


            if (isMobileDevice() && chatElement) {
                chatElement.style.display = 'none';
            }

            setTimeout(() => {
                if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 300);

        } else {

            if (isMobileDevice() && chatElement) {
                chatElement.style.display = 'flex';

                const currentScroll = window.scrollY;
                if (currentScroll > 100) {
                    chatElement.style.transform = 'translateX(-50%) translateY(100px)';
                    chatElement.style.opacity = '0';
                } else {
                    chatElement.style.transform = 'translateX(-50%) translateY(0)';
                    chatElement.style.opacity = '1';
                }
            }
        }
        
        if (socket) {
            socket.emit('chat_opened');
        }
    }

    function addMessage(text, sender) {
        const chatMessages = document.getElementById(config.selectors.chatMessages.slice(1));
        if (!chatMessages) return;

        const div = document.createElement('div');
        div.className = 'message ' + (sender === 'user' ? 'user-message' : 'manager-message');
        div.textContent = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        removeTypingIndicator();
        
        const chatMessages = document.getElementById(config.selectors.chatMessages.slice(1));
        if (!chatMessages) return;

        const div = document.createElement('div');
        div.className = 'typing-indicator';
        div.textContent = 'Менеджер печатает...';
        div.id = config.selectors.typingIndicator.slice(1);
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const typing = document.getElementById(config.selectors.typingIndicator.slice(1));
        if (typing) typing.remove();
    }

    // Универсальная отправка: сначала ищем десктопный input, иначе mobile textarea.
    function sendMessage() {
        const messageInput = document.getElementById('messageInput') || document.getElementById('mobileMessageInput');
        if (!messageInput) return;

        const msg = messageInput.value.trim();
        if (!msg) return;

        addMessage(msg, 'user');
        messageInput.value = '';
        
        if (socket) {
            socket.emit('send_message', msg);
        }

        // после отправки прокручиваем сообщения (особенно важно на мобилке)
        const chatMessages = document.getElementById(config.selectors.chatMessages.slice(1));
        if (chatMessages) {
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 50);
        }
    }

    function handleTyping() {
        if (!socket) return;

        socket.emit('typing', true);
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => socket.emit('typing', false), 800);
    }

    /* ================= MOBILE FIX: prevent page jump on iOS when keyboard opens ================= */

    function setupMobileInputBehavior() {
        if (!isMobileDevice()) return;

        const mobileTextarea = document.getElementById('mobileMessageInput');
        const chatWindow = document.getElementById('chatWindow');
        const chatMessages = document.getElementById('chatMessages');

        if (!mobileTextarea) return;

        let savedScrollY = 0;

        function onFocus() {
            // save current scroll position and fix body to prevent pan
            savedScrollY = window.scrollY || window.pageYOffset || 0;

            // apply inline styles to lock page
            document.body.style.position = 'fixed';
            document.body.style.top = `-${savedScrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';

            // small delay then scroll messages to bottom so the last messages are visible
            setTimeout(() => {
                if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 50);
        }

        function onBlur() {
            // remove inline styles and restore scroll
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';

            // restore scroll position without smooth behavior
            const prev = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo(0, savedScrollY);
            // restore scroll-behavior if there was any
            setTimeout(() => {
                document.documentElement.style.scrollBehavior = prev || '';
            }, 50);

            // reset visual adjustments
            const nativeInput = document.querySelector('.mobile-native-input');
            if (nativeInput) nativeInput.style.transform = '';
            if (chatMessages) chatMessages.style.paddingBottom = '';
        }

        mobileTextarea.addEventListener('focus', onFocus);
        mobileTextarea.addEventListener('blur', onBlur);

        // visualViewport: adjust bottom padding/transform when keyboard opens (iOS Safari)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                const vv = window.visualViewport;
                // keyboard height approx:
                const keyboardHeight = Math.max(0, window.innerHeight - vv.height);
                const nativeInput = document.querySelector('.mobile-native-input');

                if (keyboardHeight > 0) {
                    // move native input up visually so it stays above keyboard
                    if (nativeInput) nativeInput.style.transform = `translateY(-${keyboardHeight}px)`;
                    // add padding to chat messages so last messages are visible above keyboard + input
                    if (chatMessages) chatMessages.style.paddingBottom = `${keyboardHeight + 120}px`;
                    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
                } else {
                    if (nativeInput) nativeInput.style.transform = '';
                    if (chatMessages) chatMessages.style.paddingBottom = '';
                }
            });
        }
    }

    /* =============================================================================================== */

    init();

    return {
        toggleChat,
        sendMessage,
        addMessage
    };
}
