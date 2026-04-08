import { GetHeader } from "./modules/header.js";
import { MessageChat } from "./modules/MessageChat.js";
import { GetFooter } from "./modules/footer.js";
import { hidePreloader } from "./modules/preloader.js";
// import { Form } from "./modules/comonents/Post_Form.js";
import { dubbleclick } from "./modules/comonents/FAQ_question.js";
import { initProjectSlider } from "./modules/slider.js";

document.addEventListener('DOMContentLoaded', function() {
    try {
        hidePreloader();
        GetHeader();
        initProjectSlider()
        MessageChat();
        GetFooter();
        // Form();
        dubbleclick();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
    console.log(`
        web site by @pparhaty
:::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::
`);
});