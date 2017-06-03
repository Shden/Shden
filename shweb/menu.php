
    <!-- Static navbar -->
	<div class="navbar navbar-default navbar-inverse" role="navigation">
    	<div class="navbar-header">
        	<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
				<span class="sr-only">Toggle navigation</span>
          		<span class="icon-bar"></span>
          	  	<span class="icon-bar"></span>
          	  	<span class="icon-bar"></span>
        	</button>
        	<a class="navbar-brand" href="#"><b>Брод</b></a>
      	</div>
      	<div class="navbar-collapse collapse">
        	<ul class="nav navbar-nav">
          		<li><a href="status.php">Состояние дома</a></li>
          	  	<li class="dropdown">
            		<a href="#" class="dropdown-toggle" data-toggle="dropdown">Климат <b class="caret"></b></a>
        			<ul class="dropdown-menu">
			  			<li><a href="schedule.php">Таймер отопления</a></li>
			  			<li><a href="temperature.php">Температурный график</a></li>
			  			<li><a href="humidity.php">Уровень влажности</a></li>
						<li><a href="ventilation.php">Вентиляция</a></li>
	              		<li class="divider"></li>
			  			<li><a href="logview.php?log=heating.log">Лог отопления</a></li>
			  			<li><a href="logview.php?log=ventilation.log">Лог влажности</a></li>
	              		<li class="divider"></li>
			  			<li><a href="config.php">Настройки</a></li>
        			</ul>
          	  	</li>
				<li><a href="lighting.php">Освещение</a></li>
	      	  	<li class="dropdown">
        			<a href="#" class="dropdown-toggle" data-toggle="dropdown">Электроэнергия <b class="caret"></b></a>
        			<ul class="dropdown-menu">
						<li><a href="mains.php">Электропитание дома</a></li>
						<li><a href="power-meter.php">Электросчетчик</a></li>
						<li><a href="power-stat.php">Статистика</a></li>
				  		<li><a href="heatingConsumption.php">Расход на отопление</a></li>
					</ul>
				</li>
        	</ul>
      	</div><!--/.nav-collapse -->
    </div>
