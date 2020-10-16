#!/bin/bash

echo "Create certificates for the registry and devices"

echo "Create IoT registry"
openssl req -x509 -newkey rsa:4096 -keyout registry/key.pem -out registry/cert.pem -nodes -days 365 -subj '/CN=localhost'
yc iot registry create --name shwade
yc iot registry certificate add --registry-name=shwade --certificate-file=./registry/cert.pem

#echo "Create IoT devices"
#openssl req -x509 -newkey rsa:4096 -keyout device/key.pem -out device/cert.pem -nodes -days 365 -subj '/CN=localhost'
#yc iot device create --registry-name=shwade --name=t0 --certificate-file=./device/cert.pem

echo "Heating IoT device"
openssl req -x509 -newkey rsa:4096 -keyout device/heating.key -out device/heating.cert -nodes -days 365 -subj '/CN=localhost'
yc iot device create --registry-name=shwade --name=heating --certificate-file=./device/heating.cert
