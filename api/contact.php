<?php
// PHP 7.4+ / OVH. No visitor message bodies are stored on disk.
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function reply(int $code, array $body): void { http_response_code($code); echo json_encode($body, JSON_UNESCAPED_UNICODE); exit; }
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['GET', 'POST'], true)) { header('Allow: GET, POST'); reply(405, ['ok'=>false]); }
session_set_cookie_params(['httponly'=>true, 'secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'samesite'=>'Strict', 'path'=>'/']);
session_start();
if ($method === 'GET') {
 if (empty($_SESSION['contact_token'])) $_SESSION['contact_token'] = bin2hex(random_bytes(32));
 reply(200, ['token'=>$_SESSION['contact_token']]);
}
$origin = parse_url($_SERVER['HTTP_ORIGIN'] ?? '', PHP_URL_HOST);
if (!in_array($origin, ['neuroinnowacje.pl', 'www.neuroinnowacje.pl'], true)) reply(403, ['ok'=>false, 'message'=>'Odśwież stronę i spróbuj ponownie.']);
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 16000) reply(413, ['ok'=>false, 'message'=>'Wiadomość jest za długa.']);
$data = json_decode(file_get_contents('php://input', false, null, 0, 16001), true);
if (!is_array($data)) reply(400, ['ok'=>false]);
foreach (['token','name','email','message','website'] as $key) if (!isset($data[$key]) || !is_string($data[$key])) reply(400, ['ok'=>false]);
if (empty($_SESSION['contact_token']) || !hash_equals($_SESSION['contact_token'], $data['token'])) reply(403, ['ok'=>false, 'message'=>'Odśwież stronę i spróbuj ponownie.']);
if ($data['website'] !== '') reply(400, ['ok'=>false, 'message'=>'Nie udało się wysłać formularza.']);
$name = trim($data['name']); $email = trim($data['email']); $message = trim($data['message']);
if ($name === '' || strlen($name)>320 || strlen($email)>254 || !filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email) || strlen($message)<3 || strlen($message)>8000) reply(422, ['ok'=>false, 'message'=>'Sprawdź imię, adres e-mail i treść wiadomości.']);
// Per-address rate limit across sessions, using a hash rather than the IP itself.
$ratePath = sys_get_temp_dir().'/ncni-contact-'.hash('sha256', 'neuroinnowacje-contact|'.($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
$rate = fopen($ratePath, 'c+');
if (!$rate || !flock($rate, LOCK_EX)) reply(503, ['ok'=>false, 'message'=>'Formularz jest chwilowo niedostępny. Napisz na kontakt@ncni.pl.']);
$attempts = json_decode(stream_get_contents($rate), true);
$attempts = is_array($attempts) ? array_values(array_filter($attempts, static function($t) { return is_int($t) && $t>time()-3600; })) : [];
if (count($attempts)>=5 || ($attempts && end($attempts)>time()-60)) { flock($rate, LOCK_UN); fclose($rate); reply(429, ['ok'=>false, 'message'=>'Odczekaj chwilę przed kolejną wiadomością lub napisz na kontakt@ncni.pl.']); }
$attempts[]=time(); ftruncate($rate,0); rewind($rate); fwrite($rate,json_encode($attempts)); flock($rate,LOCK_UN); fclose($rate);
$body="Wiadomość z neuroinnowacje.pl\n\nImię: ".$name."\nE-mail: ".$email."\n\n".$message;
$headers=['From: Neuroinnowacje <kontakt@ncni.pl>', 'Reply-To: '.$email, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8'];
$sent=mail('kontakt@ncni.pl', 'Kontakt z neuroinnowacje.pl', $body, implode("\r\n", $headers));
if (!$sent) reply(503, ['ok'=>false, 'message'=>'Nie udało się wysłać wiadomości. Napisz bezpośrednio na kontakt@ncni.pl.']);
reply(200, ['ok'=>true]);
