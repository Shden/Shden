<html>
<head>    
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />     
  <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.12/themes/base/jquery-ui.css" rel="stylesheet" type="text/css"/>
</head>
<body>
    <?php
    include 'include/ini.php';
   
    $controller_ini = "/home/den/Shden/shc/controller.ini";

    $controller_config = parse_ini_file($controller_ini, true);
    
    //print_r($controller_config);
    
    if (isset($_REQUEST[standby]) && isset($_REQUEST[presenсe]))
    {
        $controller_config[heating][standby] = $_REQUEST[standby];
        $controller_config[heating][presence] = $_REQUEST[presenсe];
        
        //print_r($controller_config);
        
        write_ini_file($controller_ini, $controller_config);
    }
    
    ?>
    <h2>Текущие параметры настройки</h2>
    <form method="POST">
        <table>
            <tr>
                <td>Температура в режиме ожидания:</td>
                <td><input type="text" name="standby" value="<?=$controller_config[heating][standby]?>"/>
            </tr>
            <tr>
                <td>Температура в режиме присутствия:</td>
                <td><input type="text" name="presenсe" value="<?=$controller_config[heating][presence]?>"/>
            </tr>
            <tr>
                <td colspan="2">
                    <input type="submit" value="Сохранить настройки"/>
                </td>
            </tr>
        </table>
    </form>
</body>
</html>


