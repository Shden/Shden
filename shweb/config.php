<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Настройки</title>

	<?php include 'include/css.php';?>
</head>

<html>
<head>    
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />     
</head>
<body>
    <?php
    include 'include/ini.php';
   
    $controller_config = parse_ini_file($controller_ini, true);
    
    //print_r($controller_config);
    
    if (isset($_REQUEST['standby']) && isset($_REQUEST['presenсe']))
    {
        $controller_config[heating][standby] = $_REQUEST[standby];
        $controller_config[heating][standby_night] = $_REQUEST[standby_night];
        $controller_config[heating][presence] = $_REQUEST[presenсe];
        $controller_config[heating][tempdelta] = $_REQUEST[tempDelta];
        $controller_config[heating][stoppumptempdelta] = $_REQUEST[stopPumpTempDelta];
        $controller_config[heating][fluidelectricheaterofftemp] = $_REQUEST[fluidElectricHeaterOffTemp];
        $controller_config[heating][saunaFloorTemp] = $_REQUEST[saunaFloorTemp];
		
        $controller_config[comfort_sleep][sleep_mode_start_hour] = $_REQUEST[sleep_mode_start_hour];
        $controller_config[comfort_sleep][sleep_mode_end_hour] = $_REQUEST[sleep_mode_end_hour];
        $controller_config[comfort_sleep][sleep_target_temp] = $_REQUEST[sleep_target_temp];
        
        //print_r($controller_config);
        
        write_ini_file($controller_ini, $controller_config);
    }
    
    ?>
    <?php include 'menu.php';?>
    <h2>Текущие параметры настройки</h2>
    <form method="POST">
        <table>
            <tr>
                <td>Температура в режиме ожидания, день:</td>
                <td><input type="text" name="standby" value="<?=$controller_config['heating']['standby']?>"/>&deg;С
            </tr>
            <tr>
                <td>Температура в режиме ожидания, ночь:</td>
                <td><input type="text" name="standby_night" value="<?=$controller_config['heating']['standby_night']?>"/>&deg;С
            </tr>
            <tr>
                <td>Температура в режиме присутствия:</td>
                <td><input type="text" name="presenсe" value="<?=$controller_config['heating']['presence']?>"/>&deg;С
            </tr>
            <tr>
                <td>Точность поддержания температуры:</td>
                <td><input type="text" name="tempDelta" value="<?=$controller_config['heating']['tempdelta']?>"/>&deg;С
            </tr>
            <tr>
                <td>Помпа отключается при разнице температур по контуру менее:</td>
                <td><input type="text" name="stopPumpTempDelta" value="<?=$controller_config['heating']['stoppumptempdelta']?>"/>&deg;С
            </tr>
            <tr>
                <td>Отключаем ТЭН, если котел нагревает воду до:</td>
                <td><input type="text" name="fluidElectricHeaterOffTemp" value="<?=$controller_config['heating']['fluidelectricheaterofftemp']?>"/>&deg;С
            </tr>
			<tr>
				<td>Температура теплого пола в сауне:</td>
				<td><input type="text" name="saunaFloorTemp" value="<?=$controller_config['heating']['saunaFloorTemp']?>"/>&deg;C</td>
            <tr>
                <td>Начало режима комфортного сна:</td>
                <td><input type="text" name="sleep_mode_start_hour" value="<?=$controller_config['comfort_sleep']['sleep_mode_start_hour']?>"/>час.
            </tr>
            <tr>
                <td>Окончание режима комфортного сна:</td>
                <td><input type="text" name="sleep_mode_end_hour" value="<?=$controller_config['comfort_sleep']['sleep_mode_end_hour']?>"/>час.
            </tr>
            <tr>
                <td>Температура в спальнях в режиме комфортного сна:</td>
                <td><input type="text" name="sleep_target_temp" value="<?=$controller_config['comfort_sleep']['sleep_target_temp']?>"/>&deg;С
            </tr>
            <tr>
                <td colspan="2">
                    <input type="submit" value="Сохранить настройки" class="btn btn-primary" />
                </td>
            </tr>
        </table>
    </form>
    <?php $output = `cat $controller_ini`;?>
	<pre><?=$output?></pre>
	
	<?php include 'include/js.php';?>
</body>
</html>


