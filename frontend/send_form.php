<?php
require_once(__DIR__ . '/phpmailer/src/PHPMailer.php');
require_once(__DIR__ . '/phpmailer/src/SMTP.php');
require_once(__DIR__ . '/phpmailer/src/Exception.php');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /AboutUs.html');
    exit;
}

$name = trim($_POST['name'] ?? '');
$position = trim($_POST['position'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $position === '' || $phone === '' || $email === '') {
    echo 'Пожалуйста, заполните все обязательные поля.';
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo 'Некорректный email.';
    exit;
}

$nameSafe = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$positionSafe = htmlspecialchars($position, ENT_QUOTES, 'UTF-8');
$phoneSafe = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$emailSafe = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$messageSafe = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

$subject = 'Новая заявка с сайта Five Fasad';

$body = "
<!DOCTYPE html>
<html lang='ru'>
<head>
    <meta charset='UTF-8'>
</head>
<body>
    <h2>Новая заявка с сайта</h2>
    <table border='1' cellpadding='10' cellspacing='0'>
        <tr><td><strong>Имя</strong></td><td>{$nameSafe}</td></tr>
        <tr><td><strong>Должность</strong></td><td>{$positionSafe}</td></tr>
        <tr><td><strong>Телефон</strong></td><td>{$phoneSafe}</td></tr>
        <tr><td><strong>Email</strong></td><td>{$emailSafe}</td></tr>
    </table>
";

if ($messageSafe !== '') {
    $body .= "<p><strong>Сообщение:</strong><br>{$messageSafe}</p>";
}

$body .= "</body></html>";

try {
    $mail = new PHPMailer(true);
    $mail->CharSet = 'UTF-8';

    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'mofmails@gmail.com';
    $mail->Password = 'tsdzbhmemjyfjlkh';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom('mofmails@gmail.com', 'Five Fasad');
    $mail->addAddress('parkhometsnikita@gmail.com');
    $mail->addReplyTo($email, $name);

    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $body;
    $mail->AltBody = "Имя: $name\nДолжность: $position\nТелефон: $phone\nEmail: $email\nСообщение: $message";

    $mail->send();

    echo "
    <!DOCTYPE html>
    <html lang='ru'>
    <head>
        <meta charset='UTF-8'>
        <title>Заявка отправлена</title>
    </head>
    <body>
        <h2>Заявка успешно отправлена</h2>
        <p>Мы свяжемся с вами в ближайшее время.</p>
        <p><a href='/AboutUs.html'>Вернуться назад</a></p>
    </body>
    </html>";
} catch (Exception $e) {
    echo "
    <!DOCTYPE html>
    <html lang='ru'>
    <head>
        <meta charset='UTF-8'>
        <title>Ошибка</title>
    </head>
    <body>
        <h2>Ошибка при отправке</h2>
        <p>Попробуйте позже.</p>
        <p><a href='/AboutUs.html'>Вернуться назад</a></p>
    </body>
    </html>";
}