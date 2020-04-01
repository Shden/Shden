#!/bin/bash
for i in {1..100}
do
	curl 192.168.1.162:81/API/1.1/consumption/electricity/GetPowerMeterData
done
