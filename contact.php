<?php
// ヘッダーをJSONに設定
header('Content-Type: application/json; charset=utf-8');

// POSTリクエスト以外は拒否
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// 入力データの取得とサニタイズ
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

$errors = [];

// バリデーション
if (empty($name)) {
    $errors[] = 'お名前を入力してください。';
}
if (empty($email)) {
    $errors[] = 'メールアドレスを入力してください。';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'メールアドレスの形式が正しくありません。';
}
if (empty($message)) {
    $errors[] = 'お問い合わせ内容を入力してください。';
}

// エラーがある場合は返却
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => implode("\n", $errors)
    ]);
    exit;
}

// メール送信設定
$to = 'takada-ryuya@example.com'; // ※実際のアドレスに変更可能
$subject = 'ポートフォリオサイトからのお問い合わせ';

$body = "ポートフォリオサイトからお問い合わせがありました。\n\n";
$body .= "【お名前】\n{$name}\n\n";
$body .= "【メールアドレス】\n{$email}\n\n";
$body .= "【お問い合わせ内容】\n{$message}\n";

$headers = "From: info@example.com\r\n"; // 送信元アドレス（環境に合わせて設定）
$headers .= "Reply-To: {$email}\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// 日本語メール送信の設定
mb_language("Japanese");
mb_internal_encoding("UTF-8");

// メール送信実行
$success = @mb_send_mail($to, $subject, $body, $headers);

if ($success) {
    echo json_encode(['success' => true]);
} else {
    // メール送信関数自体が失敗した場合
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'メールの送信に失敗しました。サーバーの設定をご確認ください。']);
}
exit;
