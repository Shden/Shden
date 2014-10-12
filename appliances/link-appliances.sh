#!/bin/bash
echo "Creating links to appliances..."

ln -s /mnt/1wire/3A.4A370D000000/PIO.A balkonLight
ln -s /mnt/1wire/3A.4A370D000000/PIO.B streetLight150
ln -s /mnt/1wire/3A.B8380D000000/PIO.A streetLight250
