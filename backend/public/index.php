<?php
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../models/Lecturer.php';
require_once __DIR__ . '/../controllers/LecturerController.php';

try {
    $config = require __DIR__ . '/../config/database.php';
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $config['host'],
        $config['port'],
        $config['database'],
        $config['charset']
    );

    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    $lecturerModel = new Lecturer($pdo);
    require __DIR__ . '/../routes/api.php';
} catch (Throwable $error) {
    error_log($error->getMessage());
    jsonResponse(500, [
        'success' => false,
        'message' => 'Server error or database connection failed',
    ]);
}
