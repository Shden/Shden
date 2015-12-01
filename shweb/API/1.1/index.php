<?php

require '../RestServer.php';
require 'Status.php';

spl_autoload_register(); // don't load our classes unless we use them

$mode = 'debug'; // 'debug' or 'production'
$server = new RestServer($mode);
// $server->refreshCache(); // uncomment momentarily to clear the cache if classes change in production mode

$server->addClass('Status', '/status'); // adds this as a base to all the URLs in this class

$server->handle();

?>