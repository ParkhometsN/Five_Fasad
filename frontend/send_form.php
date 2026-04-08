<?php
// send_form.php - обработчик формы
header('Content-Type: application/json');

require_once('phpmailer/src/PHPMailer.php');
require_once('phpmailer/src/SMTP.php');
require_once('phpmailer/src/Exception.php');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Функция отправки письма
function sendEmail($subject, $body) {
    $mail = new PHPMailer(true);
    $mail->CharSet = 'utf-8';
    
    try {
        // Настройки SMTP (ваши работающие настройки)
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'mofmails@gmail.com';
        $mail->Password = 'tsdzbhmemjyfjlkh'; // Ваш пароль приложения
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;
        
        // Отправитель и получатель
        $mail->setFrom('mofmails@gmail.com', 'Сайт Five Fasad');
        $mail->addAddress('parkhometsnikita@gmail.com'); // Куда отправлять заявки
        
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->AltBody = strip_tags($body);
        
        return $mail->send();
    } catch (Exception $e) {
        return false;
    }
}

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    
    // Получаем данные из формы
    $name = htmlspecialchars($_POST['name'] ?? '');
    $position = htmlspecialchars($_POST['position'] ?? '');
    $phone = htmlspecialchars($_POST['phone'] ?? '');
    $email = htmlspecialchars($_POST['email'] ?? '');
    $message = htmlspecialchars($_POST['message'] ?? '');
    
    // Валидация обязательных полей
    if (empty($name) || empty($position) || empty($phone) || empty($email)) {
        $response['message'] = 'Пожалуйста, заполните все обязательные поля';
        echo json_encode($response);
        exit;
    }
    
    // Формируем письмо
    $subject = 'Новая заявка с сайта Five Fasad';
    
    $body = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                h2 { color: #333; border-bottom: 2px solid #000; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .message-box { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <h2>📋 Новая заявка с сайта</h2>
                <table>
                    <tr>
                        <th>Поле</th>
                        <th>Значение</th>
                    </tr>
                    <tr>
                        <td><strong>👤 Имя</strong></td>
                        <td>{$name}</td>
                    </tr>
                    <tr>
                        <td><strong>💼 Должность</strong></td>
                        <td>{$position}</td>
                    </tr>
                    <tr>
                        <td><strong>📞 Телефон</strong></td>
                        <td>{$phone}</td>
                    </tr>
                    <tr>
                        <td><strong>📧 Email</strong></td>
                        <td>{$email}</td>
                     </tr>
                </table>
    ";
    
    if (!empty($message)) {
        $body .= "
                <div class='message-box'>
                    <strong>💬 Сообщение:</strong>
                    <p>{$message}</p>
                </div>
        ";
    }
    
    $body .= "
            </div>
        </body>
        </html>
    ";
    
    if (sendEmail($subject, $body)) {
        $response['success'] = true;
        $response['message'] = 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.';
    } else {
        $response['message'] = 'Ошибка при отправке. Пожалуйста, попробуйте позже.';
    }
} else {
    $response['message'] = 'Неверный метод запроса';
}

echo json_encode($response);
?>