<?php

require '../RestServer.php';
require 'Status.php';
require 'Heating.php';

spl_autoload_register(); // don't load our classes unless we use them

$mode = 'debug'; // 'debug' or 'production'
$server = new RestServer($mode);
// $server->refreshCache(); // uncomment momentarily to clear the cache if classes change in production mode

$server->addClass('Status', '/status'); 
$server->addClass('Heating', '/heating');
$server->addClass('Lighting', '/lighting');

$server->handle();

?>
