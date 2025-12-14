export function Form() {
    setTimeout(() => {
        const formContainer = document.querySelector('.contact_block');
        
        if (!formContainer) {
            setTimeout(() => {
                const formContainerRetry = document.querySelector('.contact_block');
                if (formContainerRetry) {
                    renderContactForm(formContainerRetry);
                }
            }, 1000);
            return;
        }
        
        renderContactForm(formContainer);
    }, 200);
}

function renderContactForm(container) {
    const formHTML = `
        <form id="contactForm" class="contact-form">
            <div class="lfteam">
                <input class="input" type="text" name="name" placeholder="Ваше имя" required>
                <input class="input" type="text" name="position" placeholder="Должность" required>
                <input class="input" type="text" name="phone" placeholder="+7" required>
                <input class="input" type="email" name="email" placeholder="Email" required>
            </div>
            <div class="rgteam">
                <textarea class="text_area about_textarea" name="message" placeholder="Сообщение(не обязательно)" id="message"></textarea>
                <div class="inf">
                    <div class="checkbox">
                        <input type="checkbox" class="ui-checkbox" required>
                        <h4>Отправляя данную форму, я соглашаюсь с <a href="politics.html">Правилами обработки персональных данных</a></h4>
                    </div>
                    <button id="SendForm" type="submit" class="black_button">
                        <h4>Отправить</h4>
                    </button>
                </div>
            </div>
        </form>
    `;

    container.innerHTML = formHTML;
    initFormHandler();
}

function initFormHandler() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const name = formData.get('name');
        const position = formData.get('position');
        const phone = formData.get('phone');
        const email = formData.get('email');
        const message = formData.get('message') || '(не указано)';

        const telegramMessage = `Заявка вакансии/партнерство\n\nИмя: ${name}\nДолжность: ${position}\nТелефон: ${phone}\nEmail: ${email}\nСообщение: ${message}`;

        const token = '8500810444:AAHISPjpFdG-TIxWS9jcQXObKGJnbTDfxL4';
        const chatId = '866843496';
        
        const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(telegramMessage)}`;

        const submitButton = document.getElementById('SendForm');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<h4>Отправка...</h4>';
        submitButton.disabled = true;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    alert("✅ Ваши данные успешно отправлены!");
                    contactForm.reset();
                } else {
                    alert("❌ Ошибка отправки данных");
                }
            })
            .catch(error => {
                alert("❌ Ошибка сети. Попробуйте снова.");
            })
            .finally(() => {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            });
    });
}