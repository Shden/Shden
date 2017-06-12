#!/bin/bash
echo "Deploying HEAD version from github to brod..."

ssh 85.26.213.178 -p 24861 "cd Shden && git pull"
