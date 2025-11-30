import { GetHeader } from "./modules/header.js";
import { MessageChat } from "./modules/MessageChat.js";
import { GetFooter } from "./modules/footer.js";
import { hidePreloader } from "./modules/preloader.js";
import {initProjectSlider} from "./modules/slider.js"
import { Form } from "./modules/comonents/Post_Form.js";

document.addEventListener('DOMContentLoaded', function() {
    try {
        hidePreloader();
        GetHeader();
        MessageChat();
        GetFooter();
        initProjectSlider()
        // Form();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});