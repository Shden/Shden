<html>
<head>    
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />     
  <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.12/themes/base/jquery-ui.css" rel="stylesheet" type="text/css"/>
  <title>Режим отопления</title>
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js"></script>
  <script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.12/jquery-ui.min.js"></script>
  <script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.12/i18n/jquery-ui-i18n.min.js"></script>

  <script type="text/javascript">                                         
    $(document).ready(function() {
	$.datepicker.setDefaults($.datepicker.regional['ru']);
      	$("#arrive_date").datepicker();
	$("#dep_date").datepicker();
        setDefaultWeekend();
    });
    
    function setDefaultWeekend()
    {
        var nextFriday = new Date(); 
        while (nextFriday.getDay() != 5)
            nextFriday.setDate(nextFriday.getDate() + 1);
        $("#arrive_date").datepicker("setDate", nextFriday);
        var nextSunday = new Date();
        nextSunday.setDate((nextFriday.getDate() + 2));
        $("#dep_date").datepicker("setDate", nextSunday);
    }
    
    function programValidation()
    {
        var startDate = $("#arrive_date").datepicker("getDate");
        var stopDate = $("#dep_date").datepicker("getDate");
        var now = new Date();
        
        if (startDate.getDate() > stopDate.getDate()) {
            alert("Прибытие по идее должно быть раньше отъезда, видимо ошибка? Программа НЕ установлена.");
            return false;
        }
        if (startDate.getDate() < now.getDate() || stopDate.getDate() < now.getDate()) {
            alert("Одна или обе даты в прошлом, может ошибка? Программа будет установлена все равно.");
            return true;
        }
        return true;
    }
   </script>                                                               
</head> 
<body>
    <?php
    include 'include/ini.php';
   
    $controller_config = parse_ini_file($controller_ini, true);
    
    //print_r($controller_config);
    
    if (isset($_REQUEST[arrive_date]) && isset($_REQUEST[arrive_hour]) &&
        isset($_REQUEST[dep_date]) && isset($_REQUEST[dep_hour]))
    {
        $controller_config[schedule][arrive_date] = $_REQUEST[arrive_date];
        $controller_config[schedule][arrive_hour] = $_REQUEST[arrive_hour];
        $controller_config[schedule][dep_date] = $_REQUEST[dep_date];
        $controller_config[schedule][dep_hour] = $_REQUEST[dep_hour];
        
        //print_r($controller_config);
        
        write_ini_file($controller_ini, $controller_config);
    }
    ?>
<?include 'menu.php';?>
<h2>Управление режимами</h2>
<form onsubmit="return programValidation()">
<table>
	<tr>
		<td colspan="4"><b>Приедем:</b></td>
        </tr>
        <tr>
		<td>когда:</td>
                <td><input type="text" id="arrive_date" name="arrive_date"/></td>
                <td>и во сколько:</td>
                <td><select name="arrive_hour">
                        <option value="2">Ночью, к 2 часам</option>
                        <option value="12">Утром, к 12 часам</option>
                        <option value="16" selected>Днем, к 16 часам</option>
                        <option value="20">Вечером, к 20 часам</option>
                        <option value="23">Поздно вечером, к 23 часам</option>
                    </select>
                </td>
        <tr>
		<td colspan="4"><b>Уедем:</b></td>
	</tr>
		<td>когда:</td>
                <td><input type="text" id="dep_date" name="dep_date"/></td>
                <td>и во сколько:</td>
                <td><select name="dep_hour">
                        <option value="9">Утром, в 9 часов</option>
                        <option value="12">Утром, в 12 часов</option>
                        <option value="17" selected>Вечером, в 17 часов</option>
                        <option value="21">Вечером, в 21 час</option>
                    </select>
                </td>
	</tr>
        <tr>
            <td colspan="4"><input type="submit" value="Установить программу"/></td>
        </tr>
</table>
</form>
<input type="button" value="Перевести в ждущий режим прямо сейчас" 
       onclick="alert('пока не работает')"/>
<input type="button" value="Перевести в режим присутствия прямо сейчас"
       onclick="alert('пока не работает')"/>

</body>
</html>
