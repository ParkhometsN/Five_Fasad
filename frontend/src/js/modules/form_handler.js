// form_handler.js - обработка формы обратной связи

$(document).ready(function() {
    
    // Находим форму
    const $form = $('#contactForm');
    
    // Обработка отправки формы
    $form.on('submit', function(e) {
        e.preventDefault();
        
        // Собираем данные формы
        let formData = {
            name: $('input[name="name"]', this).val(),
            position: $('input[name="position"]', this).val(),
            phone: $('input[name="phone"]', this).val(),
            email: $('input[name="email"]', this).val(),
            message: $('textarea[name="message"]', this).val()
        };
        
        // Проверяем чекбокс
        let isChecked = $(this).find('.ui-checkbox').prop('checked');
        if (!isChecked) {
            showMessage('Пожалуйста, согласитесь с правилами обработки персональных данных', 'error');
            return;
        }
        
        // Валидация телефона
        let phone = formData.phone.replace(/\D/g, '');
        if (phone.length < 10) {
            showMessage('Пожалуйста, введите корректный номер телефона', 'error');
            return;
        }
        
        // Валидация email
        let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showMessage('Пожалуйста, введите корректный email адрес', 'error');
            return;
        }
        
        // Отправляем данные
        sendForm(formData, $(this));
    });
    
    // Функция отправки формы
    function sendForm(formData, formElement) {
        // Блокируем кнопку отправки
        let submitBtn = formElement.find('#SendForm');
        let originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html('<h4>Отправка...</h4>');
        
        // ВАЖНО: отправляем на PHP обработчик, а не на HTML!
        $.ajax({
        url: '/api/send-form',
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function(response) {
                console.log('Ответ сервера:', response);
                if (response.success) {
                    showMessage(response.message, 'success');
                    // Очищаем форму
                    formElement[0].reset();
                    // Сбрасываем чекбокс
                    formElement.find('.ui-checkbox').prop('checked', false);
                } else {
                    showMessage(response.message, 'error');
                }
            },
            error: function(xhr, status, error) {
                console.error('Ошибка:', error);
                console.error('Статус:', xhr.status);
                console.error('Ответ:', xhr.responseText);
                
                if (xhr.status === 404) {
                    showMessage('Ошибка: обработчик не найден. Проверьте наличие файла send_form.php', 'error');
                } else if (xhr.status === 405) {
                    showMessage('Ошибка: неверный метод запроса. Проверьте настройки сервера', 'error');
                } else {
                    showMessage('Ошибка соединения. Попробуйте позже.', 'error');
                }
            },
            complete: function() {
                // Разблокируем кнопку
                submitBtn.prop('disabled', false).html(originalText);
            }
        });
    }
    
    // Функция показа сообщений
    function showMessage(message, type) {
        // Удаляем старое сообщение, если есть
        $('.form-message').remove();
        
        let bgColor = type === 'success' ? '#4CAF50' : '#f44336';
        let icon = type === 'success' ? '✓' : '✗';
        
        let messageHtml = `
            <div class="form-message" style="
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                min-width: 300px;
                max-width: 500px;
                padding: 15px 20px;
                border-radius: 8px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 14px;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                background-color: ${bgColor};
                color: white;
            ">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px; font-weight: bold;">${icon}</span>
                    <span style="flex: 1;">${message}</span>
                    <button onclick="$(this).closest('.form-message').remove()" style="
                        background: none;
                        border: none;
                        color: white;
                        font-size: 20px;
                        cursor: pointer;
                        opacity: 0.8;
                    ">&times;</button>
                </div>
            </div>
        `;
        
        $('body').append(messageHtml);
        
        // Добавляем анимацию
        if (!$('#form-message-styles').length) {
            $('<style id="form-message-styles">')
                .prop('type', 'text/css')
                .html(`
                    @keyframes slideInRight {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                `)
                .appendTo('head');
        }
        
        // Автоматически скрываем через 5 секунд
        setTimeout(function() {
            $('.form-message').fadeOut(300, function() {
                $(this).remove();
            });
        }, 5000);
    }
});