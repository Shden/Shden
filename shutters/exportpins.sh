#!/bin/bash

# Common path for all GPIO access
BASE_GPIO_PATH=/sys/class/gpio

echo "22" > $BASE_GPIO_PATH/export
echo "out" > $BASE_GPIO_PATH/gpio22/direction

echo "6" > $BASE_GPIO_PATH/export
echo "out" > $BASE_GPIO_PATH/gpio6/direction
