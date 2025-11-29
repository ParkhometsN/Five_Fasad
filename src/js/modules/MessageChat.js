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
  let mobileInputActive = false;

  function init() {
    renderHTML();
    setupEventListeners();
    initSocket();
    setupScrollBehavior();
    setupResponsiveButton();
    window.toggleChat = toggleChat;
    window.sendMessage = sendMessage;
  }

  function renderHTML() {
    const isMobile = window.innerWidth <= 540;
    
    const mobileInput = isMobile ? `
      <div class="mobile-native-input">
        <textarea id="mobileMessageInput" placeholder="Напишите сообщение..." rows="1"></textarea>
        <button onclick="sendMobileMessage()" class="mobile-send-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
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
    
    // Инициализация мобильного инпута
    if (isMobile) {
      initMobileInput();
    }
  }

  function initMobileInput() {
    const mobileInput = document.getElementById('mobileMessageInput');
    if (!mobileInput) return;

    // Настройка авто-высоты для textarea
    mobileInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      
      // Отправка статуса печати
      handleMobileTyping();
    });

    // Отправка по Enter (но без переноса строки)
    mobileInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMobileMessage();
      }
    });

    // Фокус на мобильный инпут при открытии чата
    mobileInput.addEventListener('focus', function() {
      mobileInputActive = true;
      // Плавная прокрутка к последнему сообщению
      setTimeout(() => {
        const chatMessages = document.getElementById(config.selectors.chatMessages.slice(1));
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }, 300);
    });

    mobileInput.addEventListener('blur', function() {
      mobileInputActive = false;
    });
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

    window.addEventListener('resize', handleResize);
    
    document.addEventListener('click', (e) => {
      const chatWindow = document.querySelector(config.selectors.chatWindow);
      const chatContainer = document.querySelector('.message_chat_container');
      if (isOpen && !chatWindow.contains(e.target) && !chatContainer.contains(e.target)) {
        toggleChat();
      }
    });

    // Предотвращаем стандартное поведение iOS при фокусе
    document.addEventListener('touchstart', function() {}, {passive: true});
  }

  function handleResize() {
    setupResponsiveButton();
    
    // Переинициализация мобильного инпута при изменении размера
    if (window.innerWidth <= 540) {
      initMobileInput();
    }
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
      // На мобильных устройствах фокусируемся на нативном инпуте
      if (isMobileDevice()) {
        const mobileInput = document.getElementById('mobileMessageInput');
        if (mobileInput) {
          setTimeout(() => {
            mobileInput.focus();
          }, 100);
        }
        
        if (chatElement) {
          chatElement.style.display = 'none';
        }
      } else {
        // На десктопе фокусируемся на обычном инпуте
        const messageInput = document.getElementById(config.selectors.messageInput.slice(1));
        if (messageInput) messageInput.focus();
      }

      const chatMessages = document.getElementById(config.selectors.chatMessages.slice(1));
      if (chatMessages) {
        setTimeout(() => {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 300);
      }
    } else {
      // При закрытии чата на мобилке возвращаем кнопку чата
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
      
      // Сбрасываем фокус
      if (document.activeElement) {
        document.activeElement.blur();
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

    // На мобилке дополнительно прокручиваем к низу после добавления сообщения
    if (isMobileDevice()) {
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 50);
    }
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

  function sendMessage() {
    const messageInput = document.getElementById(config.selectors.messageInput.slice(1));
    if (!messageInput) return;

    const msg = messageInput.value.trim();
    if (!msg) return;

    addMessage(msg, 'user');
    messageInput.value = '';
    
    if (socket) {
      socket.emit('send_message', msg);
    }
  }

  function sendMobileMessage() {
    const mobileInput = document.getElementById('mobileMessageInput');
    if (!mobileInput) return;

    const msg = mobileInput.value.trim();
    if (!msg) return;

    addMessage(msg, 'user');
    mobileInput.value = '';
    mobileInput.style.height = 'auto';
    
    if (socket) {
      socket.emit('send_message', msg);
      socket.emit('typing', false);
    }
  }

  function handleTyping() {
    if (!socket) return;
    socket.emit('typing', true);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => socket.emit('typing', false), 800);
  }

  function handleMobileTyping() {
    if (!socket) return;
    socket.emit('typing', true);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => socket.emit('typing', false), 800);
  }

  // Добавляем глобальную функцию для мобильной отправки
  window.sendMobileMessage = sendMobileMessage;

  init();

  return {
    toggleChat,
    sendMessage,
    addMessage,
    sendMobileMessage
  };
}