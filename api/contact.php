<?php
http_response_code(410);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
echo json_encode(['ok'=>false, 'message'=>'Odśwież stronę i skorzystaj z aktualnego formularza.'], JSON_UNESCAPED_UNICODE);
