import { GetHeader } from "./modules/header.js"
import { MessageChat } from "./modules/MessageChat.js"
import { GetFooter } from "./modules/footer.js"
import { hidePreloader } from "./modules/preloader.js"
import { MainSlider } from "./modules/slider.js"

document.addEventListener('DOMContentLoaded', function() {
    hidePreloader()
    GetHeader()
    MessageChat()
    GetFooter()
    MainSlider()
})