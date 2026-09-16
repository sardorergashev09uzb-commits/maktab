@echo off
title Maktab API - Cloudflare Tunnel
echo ========================================================
echo        Maktab Backend API - Cloudflare Tunnel
echo ========================================================
echo.
echo PHP API (http://127.0.0.1:8080) xavfsiz global HTTPS manzilga ulanmoqda...
echo Biroz kuting, oynada "https://....trycloudflare.com" havolasi chiqadi.
echo.
echo Ushbu oynani yopmang! Oyna ochiq tursa, API internetda ishlab turadi.
echo ========================================================
echo.
c:\laragon\bin\cloudflared\cloudflared.exe tunnel --url http://127.0.0.1:8080
pause
