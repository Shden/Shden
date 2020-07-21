#!/bin/bash
echo "Creating links to appliances..."

ln -s /mnt/1wire/3A.4A370D000000/PIO.A balkonLight
ln -s /mnt/1wire/3A.4A370D000000/PIO.B streetLight150
ln -s /mnt/1wire/3A.B8380D000000/PIO.A streetLight250
ln -s /mnt/1wire/3A.35EE0E000000/PIO.B mainsSwitch
ln -s /mnt/1wire/3A.35EE0E000000/PIO.A fenceLight
ln -s /mnt/1wire/28.0FF26D020000/temperature outsideTemp
ln -s /mnt/1wire/28.99C68D020000/temperature bedRoomTemp
ln -s /mnt/1wire/28.AAC56D020000/temperature kitchenTemp
ln -s /mnt/1wire/3A.14280D000000/PIO.A bathVentilationSwitch
ln -s /mnt/1wire/3A.C19703000000/PIO.B rodentsRepellerSwitch
ln -s /mnt/1wire/3A.3E9403000000/PIO.A mainHeater
