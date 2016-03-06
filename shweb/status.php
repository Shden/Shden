<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>House status</title>

	<?php include 'include/css.php';?>
	
	<!-- Shweb cutom styles -->
	<link rel="stylesheet" href="css/shweb.css">
</head>
<body>

<style>
	.temp-big
	{
		font-size: 48px;
	}

	.temp-warm
	{
		color: green;
	}

	.temp-cold
	{
		color: blue;
	}
</style>

<?php 
include 'menu.php';
include 'include/js.php';
?>

<div class="jumbotron">
	<div class="container" align="center">
		<h1 id="statusHdr"></h1>
		<p>
			В доме: <span id="inside" class="temp-big">--.--</span>
			На улице: <span id="outside" class="temp-big">--.--</span>
			<a role="button" class="btn btn-default" href="javascript:updateForm();">
				<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>
			</a>
		</p>
		<a id="modeBtn" class="btn btn-lg" role="button"></a>
	</div>
</div>
<div class="row" align="center">
  	<div class="col-md-6" align=center>
		<table>
			<tr>
				<td><b>24 часа:</b></td>
				<td><small>[min/avg/max] <a href="heating.php?days=1">Подробнее >></a></small></td>
			</tr>
			<tr>
				<td>&nbsp;в доме</td>
				<td><span id="MIN_INT_H24"></span>/<span id="AVG_INT_H24"></span>/<span id="MAX_INT_H24"></span></td>
			</tr>
			<tr>
				<td>&nbsp;на улице</td>
				<td><span id="MIN_EXT_H24"></span>/<span id="AVG_EXT_H24"></span>/<span id="MAX_EXT_H24"></span></td>
			</tr>
		</table>
	</div>
  	<div class="col-md-6" align="center">
		<table>
			<tr>
				<td><b>30 дней:</b></td>
				<td><small>[min/avg/max] <a href="heating.php?days=30">Подробнее >></a></small></td>
			</tr>
			<tr>
				<td>&nbsp;в доме</td>
				<td><span id="MIN_INT_D30"></span>/<span id="AVG_INT_D30"></span>/<span id="MAX_INT_D30"></span></td>
			</tr>
			<tr>
				<td>&nbsp;на улице</td>
				<td><span id="MIN_EXT_D30"></span>/<span id="AVG_EXT_D30"></span>/<span id="MAX_EXT_D30"></span></td>
			</tr>
		</table>
	</div>
</div>
<div id="spinner" class="spinner">

<script>
	$(document).ready(function() {
		updateForm();
	});

	function updateForm() 
	{	
		$('#spinner').show();
		var spinner = createSpinner('spinner');
	
		$.getJSON(GetAPIURL("status/GetHouseStatus"))
			.done(function(data) {

				refreshControls(data);
				
				spinner.stop();
				$('#spinner').hide();
			})
			.fail(function() {
				alert('Ошибка вызова GetHouseStatus.');
			});
	}
	
	function refreshControls(data) 
	{
		formatTemp($('#inside'), data.climate.inTemp);
		formatTemp($('#outside'), data.climate.outTemp);

		formatTemp($('#MIN_INT_H24'), data.tempStat.day.inside.min);
		formatTemp($('#AVG_INT_H24'), data.tempStat.day.inside.avg);
		formatTemp($('#MAX_INT_H24'), data.tempStat.day.inside.max);

		formatTemp($('#MIN_EXT_H24'), data.tempStat.day.outside.min);
		formatTemp($('#AVG_EXT_H24'), data.tempStat.day.outside.avg);
		formatTemp($('#MAX_EXT_H24'), data.tempStat.day.outside.max);
		
		formatTemp($('#MIN_INT_D30'), data.tempStat.month.inside.min);
		formatTemp($('#AVG_INT_D30'), data.tempStat.month.inside.avg);
		formatTemp($('#MAX_INT_D30'), data.tempStat.month.inside.max);

		formatTemp($('#MIN_EXT_D30'), data.tempStat.month.outside.min);
		formatTemp($('#AVG_EXT_D30'), data.tempStat.month.outside.avg);
		formatTemp($('#MAX_EXT_D30'), data.tempStat.month.outside.max);
		
		var modeBtn = $('#modeBtn');
		var statusHdr = $('#statusHdr');
		
		if (data.mode.presence == 1) {
			statusHdr.html('Режим присутствия');
			modeBtn.html('В режим ожидания');
			modeBtn.addClass('btn-primary').removeClass('btn-danger');
			modeBtn.attr('href', 'javascript:SetHouseMode(0)');
		}
		else if (data.mode.presence == 0) {
			statusHdr.html('Режим ожидания');
			modeBtn.html('В режим присутствия');
			modeBtn.addClass('btn-danger').removeClass('btn-primary');
			modeBtn.attr('href', 'javascript:SetHouseMode(1)');
		}
	}
	
	function formatTemp(control, value) 
	{
		var strValue = numeral(value).format('0.0') + '&nbsp;&deg;C';
		if (value > 0) strValue = '+' + strValue;
		
		control.html(strValue);
		
		if (value > +2.0) control.addClass('temp-warm').removeClass('temp-cold');
		if (value < -2.0) control.addClass('temp-cold').removeClass('temp-warm');
	}
	
	function SetHouseMode(mode) 
	{
		$('#spinner').show();
		var spinner = createSpinner('spinner');
	
		var API = GetAPIURL("status/SetHouseMode");
		$.ajax({
		    url: API + '/' + mode,
		    type: 'PUT',
			dataType: 'json',
		    success: function(data) {
				refreshControls(data);

				spinner.stop();
				$('#spinner').hide();
				
				if (data.mode.presence == mode)
				{
					alert('Дом переведен в режим ' + ((mode == 0) ? 'ожидания.' : 'присутствия.'));
				}
				else
				{
					alert('Ошибка: режим не изменился.');
				}
		    },
			error: function(xhr, status, error) {
				alert('Ошибка: ' + error);
			}
		});		
	}
</script>
</body>
</html>
