<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /AboutUs.html');
    exit;
}

function renderPage(string $title, string $message): void {
    echo "<!DOCTYPE html>
    <html lang='ru'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>" . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . "</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: #f7f7f7;
                color: #222;
                margin: 0;
                padding: 40px 20px;
            }
            .box {
                max-width: 640px;
                margin: 0 auto;
                background: #fff;
                border-radius: 12px;
                padding: 32px;
                box-shadow: 0 8px 24px rgba(0,0,0,.08);
            }
            h1 {
                margin-top: 0;
                font-size: 28px;
            }
            p {
                line-height: 1.6;
            }
            a {
                color: #111;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class='box'>
            <h1>" . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . "</h1>
            <p>" . nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')) . "</p>
            <p><a href='/AboutUs.html'>Вернуться назад</a></p>
        </div>
    </body>
    </html>";
    exit;
}

$name = trim($_POST['name'] ?? '');
$position = trim($_POST['position'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $position === '' || $phone === '' || $email === '') {
    renderPage('Ошибка', 'Пожалуйста, заполните все обязательные поля.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    renderPage('Ошибка', 'Указан некорректный email.');
}

$apiToken = getenv('MAILERSEND_API_TOKEN') ?: '';
$fromEmail = getenv('MAILERSEND_FROM_EMAIL') ?: '';
$fromName = getenv('MAILERSEND_FROM_NAME') ?: 'Five Fasad';
$toEmail = getenv('MAILERSEND_TO_EMAIL') ?: '';

if ($apiToken === '' || $fromEmail === '' || $toEmail === '') {
    error_log('MailerSend config error: missing environment variables');
    renderPage('Ошибка', 'Сервис отправки временно не настроен.');
}

$nameSafe = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$positionSafe = htmlspecialchars($position, ENT_QUOTES, 'UTF-8');
$phoneSafe = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$emailSafe = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$messageSafe = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

$subject = 'Новая заявка с сайта Five Fasad';

$htmlContent = "
<!DOCTYPE html>
<html lang='ru'>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h2 { color: #333; border-bottom: 2px solid #000; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .label { width: 180px; font-weight: bold; background: #f2f2f2; }
        .message-box { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class='container'>
        <h2>Новая заявка с сайта</h2>
        <table>
            <tr><td class='label'>Имя</td><td>{$nameSafe}</td></tr>
            <tr><td class='label'>Должность</td><td>{$positionSafe}</td></tr>
            <tr><td class='label'>Телефон</td><td>{$phoneSafe}</td></tr>
            <tr><td class='label'>Email</td><td>{$emailSafe}</td></tr>
        </table>";

if ($messageSafe !== '') {
    $htmlContent .= "<div class='message-box'><strong>Сообщение:</strong><p>{$messageSafe}</p></div>";
}

$htmlContent .= "
    </div>
</body>
</html>";

$textContent =
    "Новая заявка с сайта Five Fasad\n\n" .
    "Имя: {$name}\n" .
    "Должность: {$position}\n" .
    "Телефон: {$phone}\n" .
    "Email: {$email}\n" .
    "Сообщение: {$message}\n";

$payload = [
    'from' => [
        'email' => $fromEmail,
        'name' => $fromName
    ],
    'to' => [
        [
            'email' => $toEmail,
            'name' => 'Менеджер'
        ]
    ],
    'reply_to' => [
        'email' => $email,
        'name' => $name
    ],
    'subject' => $subject,
    'html' => $htmlContent,
    'text' => $textContent
];

$ch = curl_init('https://api.mailersend.com/v1/email');

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Bearer ' . $apiToken,
    ],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
]);

$response = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

if ($response === false) {
    error_log('MailerSend cURL error: ' . $curlError);
    renderPage('Ошибка отправки', 'Не удалось связаться с сервисом отправки писем.');
}

if ($httpCode === 202) {
    renderPage('Заявка отправлена', 'Спасибо. Ваша заявка успешно отправлена, мы свяжемся с вами в ближайшее время.');
}

error_log('MailerSend API error. HTTP ' . $httpCode . '. Response: ' . $response);
renderPage('Ошибка отправки', 'Сейчас не удалось отправить заявку. Попробуйте немного позже.');