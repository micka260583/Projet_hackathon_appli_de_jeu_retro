<?php

/**
 * This file dispatch routes.
 *
 * PHP version 7
 *
 * @author   WCS <contact@wildcodeschool.fr>
 *
 * @link     https://github.com/WildCodeSchool/simple-mvc
 */

use App\Controller\HomeController;

$routeParts = explode('/', ltrim($_SERVER['REQUEST_URI'], '/') ?: HOME_PAGE);
$controller = 'App\Controller\\' . ucfirst($routeParts[0] ?? '') . 'Controller';
$method = $routeParts[1] ?? '';
$vars = array_slice($routeParts, 2);

if (class_exists($controller) && method_exists(new $controller(), $method)) {
    echo (new $controller())->$method(...$vars);
} else {
    echo (new HomeController())->notFound();
    exit();
}
