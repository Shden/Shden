<?php

require '../RestServer.php';
require 'Status.php';
require 'Climate.php';
require 'Lighting.php';
require 'ElectricityConsumption.php';
require 'Gateways.php';
require 'Repellers.php';

spl_autoload_register(); // don't load our classes unless we use them

$mode = 'debug'; // 'debug' or 'production'
$server = new Jacwright\RestServer\RestServer($mode);
// $server->refreshCache(); // uncomment momentarily to clear the cache if classes change in production mode

$server->addClass('Status', '/status');
$server->addClass('Climate', '/climate');
$server->addClass('Lighting', '/lighting');
$server->addClass('ElectricityConsumption', '/consumption/electricity');
$server->addClass('Gateways', '/gateways');
$server->addClass('Repellers', '/repellers');

$server->handle();

?>
