import { GetHeader } from "./modules/header.js"
import { MessageChat } from "./modules/MessageChat.js"
import { GetFooter } from "./modules/footer.js"
import { Preloader } from "./modules/preloader.js"
import { MainSlider } from "./modules/slider.js"

document.addEventListener('DOMContentLoaded', function() {
    GetHeader()
    MessageChat()
    GetFooter()
    // Preloader()
    MainSlider()
})