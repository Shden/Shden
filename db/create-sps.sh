#!/bin/bash
echo "Creating stored procedures..."

sudo mysql -u root -D SHDEN < create_db.sql
sudo mysql -u root -D SHDEN < sp_change_presence.sql
sudo mysql -u root -D SHDEN < sp_get_power_statistics.sql
sudo mysql -u root -D SHDEN < sp_get_statistics.sql
sudo mysql -u root -D SHDEN < sp_heating_consumption.sql
sudo mysql -u root -D SHDEN < sp_add_heating_record.sql
