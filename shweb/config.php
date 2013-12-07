<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Настройки</title>

	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">
	
	<!-- Optional theme -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap-theme.min.css">
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
                <td colspan="2">
                    <input type="submit" value="Сохранить настройки" class="btn btn-primary" />
                </td>
            </tr>
        </table>
    </form>
    <?php $output = `cat $controller_ini`;?>
	<pre><?=$output?></pre>
	
	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<script src="https://code.jquery.com/jquery.js"></script>
	<!-- Latest compiled and minified JavaScript -->
	<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>
</body>
</html>


