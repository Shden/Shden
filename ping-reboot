#!/bin/sh
PINGADRESS=77.88.21.11 # yandex.ru
sleep 60
while true; do 
if ping -c 1 $PINGADRESS > /dev/null 2>&1 ; then
sleep 60
else
reboot
fi
done
exit 0
