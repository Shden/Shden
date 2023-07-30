#!/bin/bash
echo "Creating stored procedures..."

mysql -u root -p -D SHDEN < create_db.sql
mysql -u root -p -D SHDEN < sp_change_presence.sql
mysql -u root -p -D SHDEN < sp_get_power_statistics.sql
mysql -u root -p -D SHDEN < sp_get_statistics.sql
mysql -u root -p -D SHDEN < sp_heating_consumption.sql
mysql -u root -p -D SHDEN < sp_add_heating_record.sql
mysql -u root -p -D SHDEN < sp_add_humidity_record.sql
mysql -u root -p -D SHDEN < sp_add_power_record.sql
mysql -u root -p -D SHDEN < sp_add_network_record.sql
