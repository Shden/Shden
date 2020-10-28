#!/bin/bash

# Common path for all GPIO access
BASE_GPIO_PATH=/sys/class/gpio

echo "6" > $BASE_GPIO_PATH/export
echo "out" > $BASE_GPIO_PATH/gpio6/direction

echo "13" > $BASE_GPIO_PATH/export
echo "out" > $BASE_GPIO_PATH/gpio13/direction

echo "20" > $BASE_GPIO_PATH/export
echo "out" > $BASE_GPIO_PATH/gpio20/direction
