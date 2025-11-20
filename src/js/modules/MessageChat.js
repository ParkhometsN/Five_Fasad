export function MessageChat (){
    const ContainerMessageChat  = document.querySelector('.message_chat')
    const MessageChatHtml = `
            <div class="message_chat_container stroke_main">
                <div class="message_chat_content ">
                    <div class="openchat">
                        <img src="./src/assests/svg/chat.svg" alt="иконка для чата">
                        <h4>Чат с менеджером</h4>
                    </div>
                </div>
                <a href="tel:+77778889900">
                    <button class="phonecall"><img src="./src/assests/svg/phone.svg" alt="иконка телефона"></button>
                </a>
            </div>
    `
    ContainerMessageChat.innerHTML = MessageChatHtml
}