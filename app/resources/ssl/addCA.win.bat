@echo off

@echo Installing "CryptoARM Local CA" certificate
certutil -addstore -user root %~dp0\root.pem
