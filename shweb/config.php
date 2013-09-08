<html>
<head>    
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />     
</head>
<body>
    <?php
    include 'include/ini.php';
   
    $controller_config = parse_ini_file($controller_ini, true);
    
    //print_r($controller_config);
    
    if (isset($_REQUEST[standby]) && isset($_REQUEST[presenсe]))
    {
        $controller_config[heating][standby] = $_REQUEST[standby];
        $controller_config[heating][standby_night] = $_REQUEST[standby_night];
        $controller_config[heating][presence] = $_REQUEST[presenсe];
        $controller_config[heating][tempDelta] = $_REQUEST[tempDelta];
        $controller_config[heating][stopPumpTempDelta] = $_REQUEST[stopPumpTempDelta];
        $controller_config[heating][fluidElectricHeaterOffTemp] = $_REQUEST[fluidElectricHeaterOffTemp];
        
        //print_r($controller_config);
        
        write_ini_file($controller_ini, $controller_config);
    }
    
    ?>
    <?include 'menu.php';?>
    <h2>Текущие параметры настройки</h2>
    <form method="POST">
        <table>
            <tr>
                <td>Температура в режиме ожидания, день:</td>
                <td><input type="text" name="standby" value="<?=$controller_config[heating][standby]?>"/><sup>o</sup>С
            </tr>
            <tr>
                <td>Температура в режиме ожидания, ночь:</td>
                <td><input type="text" name="standby_night" value="<?=$controller_config[heating][standby_night]?>"/><sup>o</sup>С
            </tr>
            <tr>
                <td>Температура в режиме присутствия:</td>
                <td><input type="text" name="presenсe" value="<?=$controller_config[heating][presence]?>"/><sup>o</sup>С
            </tr>
            <tr>
                <td>Точность поддержания температуры:</td>
                <td><input type="text" name="tempDelta" value="<?=$controller_config[heating][tempDelta]?>"/><sup>o</sup>С
            </tr>
            <tr>
                <td>Помпа отключается при разнице температур по контуру менее:</td>
                <td><input type="text" name="stopPumpTempDelta" value="<?=$controller_config[heating][stopPumpTempDelta]?>"/><sup>o</sup>С
            </tr>
            <tr>
                <td>Отключаем ТЭН, если котел нагревает воду до:</td>
                <td><input type="text" name="fluidElectricHeaterOffTemp" value="<?=$controller_config[heating][fluidElectricHeaterOffTemp]?>"/><sup>o</sup>С
            </tr>
            <tr>
                <td colspan="2">
                    <input type="submit" value="Сохранить настройки"/>
                </td>
            </tr>
        </table>
    </form>
    <?
    $output = `cat /home/den/Shden/shc/controller_config/controller.ini`;
    print "<pre>$output</pre>";
    ?>
</body>
</html>


