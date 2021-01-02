<!-- Static navbar -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
	<a class="navbar-brand" href="#">Брод</a>
  	<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    		<span class="navbar-toggler-icon"></span>
  	</button>

	<div class="collapse navbar-collapse" id="navbarSupportedContent">
		<ul class="navbar-nav mr-auto">
			<li class="nav-item active">
				<a class="nav-link" href="status.php">Состояние дома</a>
			</li>
			<li class="nav-item dropdown">
				<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					Климат
				</a>
				<div class="dropdown-menu" aria-labelledby="navbarDropdown">
					<a class="dropdown-item" href="schedule.php">Таймер отопления</a>
					<a class="dropdown-item" href="temperature.php">Температурный график</a>
					<a class="dropdown-item" href="humidity.php">Уровень влажности</a>
					<a class="dropdown-item" href="ventilation.php">Вентиляция</a>
					<div class="dropdown-divider"></div>
					<a class="dropdown-item" href="config.php">Настройки</a>
				</div>
			</li>
			<li class="nav-item active">
				<a class="nav-link" href="lighting.php">Освещение</a>
			</li>
			<li class="nav-item dropdown">
				<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					Электроэнергия
				</a>
				<div class="dropdown-menu" aria-labelledby="navbarDropdown">
					<a class="dropdown-item" href="power-meter.php">Электросчетчик</a>
					<a class="dropdown-item" href="power-stat.php">Статистика</a>
				</div>
			</li>
		</ul>
	</div>
</nav>
<br/>
