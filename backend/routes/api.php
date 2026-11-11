<?php
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($path === '/api/health' && $method === 'GET') {
    jsonResponse(200, ['success' => true, 'message' => 'Lecturer API is running']);
}

$controller = new LecturerController($lecturerModel);

$route = $method . ' ' . $path;

$routes = [
    'GET /api/lecturers' => fn() => $controller->index(),
    'POST /api/lecturers' => fn() => $controller->store(),
    'PUT /api/lecturers' => fn() => $controller->update(),
    'DELETE /api/lecturers' => fn() => $controller->destroy(),
];

if (isset($routes[$route])) {
    $routes[$route]();
    exit;
}

jsonResponse(404, ['success' => false, 'message' => 'API endpoint not found']);
