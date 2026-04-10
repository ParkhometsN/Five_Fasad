<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once(__DIR__ . '/phpmailer/src/PHPMailer.php');
require_once(__DIR__ . '/phpmailer/src/SMTP.php');
require_once(__DIR__ . '/phpmailer/src/Exception.php');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo "GET detected. send_form.php works, but accepts only POST.";
    exit;
}

echo "POST received.<br>";

$name = trim($_POST['name'] ?? '');
$position = trim($_POST['position'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $position === '' || $phone === '' || $email === '') {
    exit('Ошибка: обязательные поля пустые.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    exit('Ошибка: некорректный email.');
}

echo "Validation passed.<br>";

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

    $mail->Timeout = 20;
    $mail->SMTPDebug = 2;
    $mail->Debugoutput = 'html';

    echo "SMTP config set.<br>";

    $mail->setFrom('mofmails@gmail.com', 'Five Fasad');
    $mail->addAddress('parkhometsnikita@gmail.com');
    $mail->addReplyTo($email, $name);

    $mail->isHTML(true);
    $mail->Subject = 'Новая заявка с сайта Five Fasad';
    $mail->Body = "
        <h2>Новая заявка с сайта</h2>
        <p><strong>Имя:</strong> " . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "</p>
        <p><strong>Должность:</strong> " . htmlspecialchars($position, ENT_QUOTES, 'UTF-8') . "</p>
        <p><strong>Телефон:</strong> " . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . "</p>
        <p><strong>Email:</strong> " . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</p>
        <p><strong>Сообщение:</strong><br>" . nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')) . "</p>
    ";

    echo "Before send.<br>";

    $mail->send();

    echo "<h2>Письмо успешно отправлено</h2>";
} catch (Exception $e) {
    echo "<h2>Ошибка отправки</h2>";
    echo "<pre>" . htmlspecialchars($mail->ErrorInfo ?: $e->getMessage(), ENT_QUOTES, 'UTF-8') . "</pre>";
}