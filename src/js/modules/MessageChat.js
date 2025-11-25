export function MessageChat() {
    const ContainerMessageChat = document.querySelector('.message_chat');
    const MessageChatHtml = `
        <div class="message_chat_container stroke_main">
            <div class="message_chat_content">
                <div class="openchat">
                    <img src="./src/assests/svg/chat.svg" alt="иконка для чата">
                    <h4>Чат с менеджером</h4>
                </div>
            </div>
            <a href="tel:+77778889900">
                <button class="phonecall"><img src="./src/assests/svg/phone.svg" alt="иконка телефона"></button>
            </a>
        </div>
    `;
    ContainerMessageChat.innerHTML = MessageChatHtml;

    let lastScroll = 0;
    const element = ContainerMessageChat.querySelector('.message_chat_container');

    window.addEventListener('scroll', function() {
        const currentScroll = window.scrollY;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            element.style.transform = 'translateX(-50%) translateY(100px)';
            element.style.opacity = '0';
        } else {
            element.style.transform = 'translateX(-50%) translateY(0)';
            element.style.opacity = '1';
        }
        
        lastScroll = currentScroll;
    });
}