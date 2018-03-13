#!/bin/sh

sudo cp  ./root.pem /usr/local/share/ca-certificates/
sudo update-ca-certificates
