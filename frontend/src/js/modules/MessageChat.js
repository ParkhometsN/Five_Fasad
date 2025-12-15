export function MessageChat() {
  const ContainerMessageChat = document.querySelector('.message_chat');
  if (!ContainerMessageChat) {
    console.warn('Message chat container not found');
    return;
  }

  let isOpen = false;
  let lastScroll = 0;
  let socket;
  let chatElement;
  let welcomeMessageAdded = false; // Флаг, чтобы приветствие добавлялось только один раз

  function init() {
    renderHTML();
    setupEventListeners();
    initSocket();
    setupScrollBehavior();

    window.toggleChat = toggleChat;
    window.sendMessage = sendMessage;
    window.sendMobileMessage = sendMobileMessage;
  }

  function renderHTML() {
    const isMobile = window.innerWidth <= 540;

    ContainerMessageChat.innerHTML = `
      <!-- Кнопка чата внизу экрана -->
      <div class="message_chat_container">
        <div onclick="toggleChat()" class="message_chat_content">
          <div class="openchat">
            <img src="./src/assests/svg/chat.svg" alt="чат">
            <h4>Чат с менеджером</h4>
          </div>
        </div>
        <a href="tel:+77778889900">
          <button class="phonecall">
            <img src="./src/assests/svg/phone.svg" alt="позвонить">
          </button>
        </a>
      </div>

      <!-- Окно чата -->
      <div class="chat-window" id="chatWindow">
        <div class="chat-header">
          <strong>Чат с менеджером</strong>
          <button class="close-btn" onclick="toggleChat()">×</button>
        </div>

        <div class="chat-messages" id="chatMessages"></div>

        <!-- Десктопный инпут -->
        <div class="chat-input desktop-only">
          <input type="text" id="messageInput" placeholder="Напишите сообщение..." autocomplete="off">
          <button id="sendButton" onclick="sendMessage()">Отправить</button>
        </div>
      </div>
    `;

    chatElement = ContainerMessageChat.querySelector('.message_chat_container');

    if (isMobile) {
      setTimeout(initMobileTextarea, 100);
    }
  }

  function initMobileTextarea() {
    const textarea = document.getElementById('mobileMessageInput');
    if (!textarea) return;

    textarea.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      socket?.emit('typing', true);
    });

    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMobileMessage();
      }
    });

    // Авто-фокус при открытии
    textarea.addEventListener('focus', () => {
      setTimeout(scrollToBottom, 300);
    });
  }

  function setupEventListeners() {
    // Десктопный Enter
    const desktopInput = document.getElementById('messageInput');
    if (desktopInput) {
      desktopInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendMessage();
        }
      });
    }

    // Закрытие по клику вне
    document.addEventListener('click', (e) => {
      const chat = document.getElementById('chatWindow');
      const btn = document.querySelector('.message_chat_container');
      if (isOpen && chat && btn && !chat.contains(e.target) && !btn.contains(e.target)) {
        toggleChat();
      }
    });
  }

  function initSocket() {
    const origin = window.location.origin;
    socket = io(origin, {
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    });

    const clientId = localStorage.getItem('chatClientId') || 'cid_' + Date.now().toString(36);
    localStorage.setItem('chatClientId', clientId);

    socket.on('connect', () => {
      socket.emit('identify', clientId);
    });
    
    socket.on('manager_message', (text) => {
      addMessage(text, 'manager');
    });
    
    socket.on('system_message', (text) => {
      addMessage(text, 'manager');
    });
    
    // Обработчик обновления приветственного сообщения
    socket.on('update_welcome_message', (newWelcomeMessage) => {
      const messagesContainer = document.getElementById('chatMessages');
      if (!messagesContainer) return;
      
      const messages = messagesContainer.querySelectorAll('.manager-message');
      
      // Если есть сообщения, заменяем последнее приветственное
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        
        // Проверяем, является ли это сообщение приветственным
        const isWelcomeMessage = lastMessage.textContent.includes('Здравствуйте') || 
                               lastMessage.textContent.includes('Идут технические работы') ||
                               lastMessage.textContent.includes('технические работы');
        
        if (isWelcomeMessage) {
          lastMessage.textContent = newWelcomeMessage;
        } else {
          // Если последнее сообщение не приветственное, добавляем новое
          addMessage(newWelcomeMessage, 'manager');
        }
      } else {
        // Если нет сообщений, просто добавляем
        addMessage(newWelcomeMessage, 'manager');
      }
    });
  }

  function setupScrollBehavior() {
    window.addEventListener('scroll', () => {
      if (isOpen) return;
      const y = window.scrollY;
      if (y > lastScroll && y > 100) {
        chatElement.style.transform = 'translateX(-50%) translateY(120px)';
        chatElement.style.opacity = '0';
      } else {
        chatElement.style.transform = 'translateX(-50%) translateY(0)';
        chatElement.style.opacity = '1';
      }
      lastScroll = y;
    });
  }

  function toggleChat() {
    const win = document.getElementById('chatWindow');
    const messages = document.getElementById('chatMessages');

    isOpen = !isOpen;
    win.style.display = isOpen ? 'flex' : 'none';

    if (isOpen) {
      // Скрываем кнопку на мобилке
      if (window.innerWidth <= 540) {
        chatElement.style.display = 'none';
      }

      setTimeout(() => {
        scrollToBottom();

        if (window.innerWidth <= 540) {
          const mobileInput = document.getElementById('mobileMessageInput');
          if (mobileInput) {
            mobileInput.focus();
            setTimeout(() => mobileInput.focus(), 300); // iOS fix
          }
        } else {
          document.getElementById('messageInput')?.focus();
        }
      }, 300);

    } else {
      // Возвращаем кнопку
      if (window.innerWidth <= 540) {
        chatElement.style.display = 'flex';
      }
      document.activeElement?.blur();
    }

    socket?.emit('chat_opened');
  }

  function scrollToBottom() {
    const el = document.getElementById('chatMessages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender === 'user' ? 'user-message' : 'manager-message'}`;
    div.textContent = text;
    document.getElementById('chatMessages').appendChild(div);
    scrollToBottom();
  }

  function sendMessage() {
    const input = document.getElementById('messageInput');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    addMessage(msg, 'user');
    input.value = '';
    socket?.emit('send_message', msg);
  }

  function sendMobileMessage() {
    const textarea = document.getElementById('mobileMessageInput');
    if (!textarea) return;
    const msg = textarea.value.trim();
    if (!msg) return;
    addMessage(msg, 'user');
    textarea.value = '';
    textarea.style.height = 'auto';
    socket?.emit('send_message', msg);
    socket?.emit('typing', false);
  }

  init();
}