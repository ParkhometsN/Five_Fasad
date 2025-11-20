import { GetHeader } from "./modules/header.js"
import { MessageChat } from "./modules/MessageChat.js"
import { GetFooter } from "./modules/footer.js"

document.addEventListener('DOMContentLoaded', function() {
    GetHeader()
    MessageChat()
    GetFooter()
})