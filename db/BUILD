# SHDEN DB build

1. Make sure MySQL (now MariaDB) is installed. If not:

	brew install mariadb
	mysql.server start

2. Login as root, set password:

	mysql -uroot

	use mysql;
	update user set password=PASSWORD("*******") where User='root';
	flush privileges;
	quit;

3. Create SHDEN

	create database SHDEN;
	use SHDEN;
	quit;

	mysql -uroot -p******* -DSHDEN < create_db.sql
	mysql -uroot -p******* -DSHDEN < sp_get_power_statistics.sql;
	mysql -uroot -p******* -DSHDEN < sp_heating_consumption.sql;
	mysql -uroot -p******* -DSHDEN < sp_change_presence.sql;
	mysql -uroot -p******* -DSHDEN < sp_get_statistics.sql;
	mysql -uroot -p******* -DSHDEN < sp_update_sensor.sql;

4. Create webuser to access DB

	GRANT ALL PRIVILEGES ON *.* TO 'webuser'@'localhost' IDENTIFIED BY '********';
