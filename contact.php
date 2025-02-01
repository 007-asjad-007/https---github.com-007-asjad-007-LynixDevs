<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $message = trim($_POST["message"]);

    if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid input.";
        exit;
    }

    $to = "your-email@example.com"; // Replace with your email
    $subject = "New Contact Form Message";
    $headers = "From: $email\r\nReply-To: $email\r\nContent-Type: text/plain; charset=UTF-8";

    $email_body = "Name: $name\nEmail: $email\n\nMessage:\n$message";

    if (mail($to, $subject, $email_body, $headers)) {
        echo "Success";
    } else {
        echo "Failed";
    }
}
?>