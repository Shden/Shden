<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

  	<title>Таймер отопления</title>

	<?php include 'include/css.php';?>
	
	<!-- Shweb cutom styles -->
	<link rel="stylesheet" href="css/shweb.css">
	<link rel="stylesheet" href="css/datepicker.css">
	
	<style>
	#alert {
		display: none;
	}
	.form-schedule {
		max-width: 640px;
		padding: 15px;
		margin: 0 auto;
	}
	.form-schedule input[type=text] {
	  	width: 160px;
		height: 18;
	}
	.form-schedule select {
	  	width: 160px;
		height: 18;
		font-size: 12px;
	}
	</style>
	
	<script src="http://code.jquery.com/jquery-2.0.3.min.js"></script>
	
    <script src="js/bootstrap-datepicker.js"></script>
	
  	<script type="text/javascript">     
	
	    $(document).ready(function() {
			$('#arrive_date').datepicker({
				format: 'dd.mm.yyyy'
			});     
			$('#dep_date').datepicker({
				format: 'dd.mm.yyyy'
			});			

			/* Setting default start and end dates to the next weekend (Friday to Sunday) */
	        var startDate = new Date(); 
	        while (startDate.getDay() != 5)
	            startDate.setDate(startDate.getDate() + 1);
	        $("#arrive_date").datepicker("setValue", startDate);
	        
			var endDate = new Date();
	        endDate.setDate((startDate.getDate() + 2));
	        $("#dep_date").datepicker("setValue", endDate);

			/* Dates validation handlers */
			$('#arrive_date').datepicker()
				.on('changeDate', function(ev){
					if (ev.date.valueOf() > endDate.valueOf()){
						$('#alert').show().find('strong').text('Предупреждение: дата прибытия должна быть раньше даты отъезда.');
					} else {
						$('#alert').hide();
						startDate = new Date(ev.date);
					}
					$('#arrive_date').datepicker('hide');
				});
			$('#dep_date').datepicker()
				.on('changeDate', function(ev){
					if (ev.date.valueOf() < startDate.valueOf()){
						$('#alert').show().find('strong').text('Предупреждение: дата отъезда должна быть после даты прибытия.');
					} else {
						$('#alert').hide();
						endDate = new Date(ev.date);
					}
					$('#dep_date').datepicker('hide');
				});

			//$.datepicker.setDefaults($.datepicker.regional['ru']);
	    });
	</script>                                                               
</head> 
<body>
    <?php include 'include/ini.php';
   
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
    
	include 'menu.php';?>
	
	<div class="container" align="center">
		<h2>Таймер отопления</h2>
		<form role="form" class="form-schedule">
			<div class="alert alert-warning" id="alert">
				<strong>Oh snap!</strong>
			</div>
			<div>
				<label for="arrive_date">Приедем:</label>
			</div>
			<div>
				<input type="text" id="arrive_date" name="arrive_date"/> 
				<select name="arrive_hour" id="arrive_hour">
	                <option value="2">Ночью, к 2 часам</option>
	                <option value="12">Утром, к 12 часам</option>
	                <option value="16" selected>Днем, к 16 часам</option>
	                <option value="20">Вечером, к 20 часам</option>
	                <option value="23">Поздно вечером, к 23 часам</option>
	            </select>
			</div>
			<div>
				<label for="dep_date">Уедем:</label>
			</div>
			<div>
				<input type="text" id="dep_date" name="dep_date"/> 
				<select name="dep_hour" id="dep_hour">
                    <option value="9">Утром, в 9 часов</option>
                    <option value="12">Утром, в 12 часов</option>
                    <option value="17" selected>Вечером, в 17 часов</option>
                    <option value="21">Вечером, в 21 час</option>
                </select>
			</div>
			<div>
				<br/><input type="submit" class="btn btn-primary" value="Установить программу"/>
			</div>
		</form>
	</div>
	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<!-- Latest compiled and minified JavaScript -->
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
</body>
</html>
