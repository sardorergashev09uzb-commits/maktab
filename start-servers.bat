@echo off
title Maktab Platformasi - Serverlar
echo ========================================================
echo         Maktab Platformasini Ishga Tushirish
echo ========================================================
echo.

echo [1/3] MySQL (Port 3306) tekshirilmoqda...
powershell -Command "if (!(Test-NetConnection -ComputerName 127.0.0.1 -Port 3306 -InformationLevel Quiet)) { Start-Process -FilePath 'C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe' -ArgumentList '--defaults-file=C:\laragon\bin\mysql\mysql-8.4.3-winx64\my.ini' -WindowStyle Hidden }"

echo [2/3] PHP REST API (Port 8080) alohida oynada ishga tushirilmoqda...
start "Maktab PHP API (8080)" cmd /k "php -S 127.0.0.1:8080 -t C:\laragon\www\maktab\api\web C:\laragon\www\maktab\api\web\index.php"

echo [3/3] Cloudflare Tunnel (Internetga ulash) ishga tushirilmoqda...
start "Maktab Cloudflare Tunnel" cmd /k "c:\laragon\bin\cloudflared\cloudflared.exe tunnel --url http://127.0.0.1:8080"

echo.
echo ========================================================
echo   Serverlar va Cloudflare Tunnel ishga tushirildi!
echo.
echo   1. "Maktab Cloudflare Tunnel" oynasiga qarang.
echo      U yerda "https://....trycloudflare.com" chiqadi.
echo.
echo   2. Telefon ilovangizda (APK) yuqori o'ng burchakdagi
echo      "Server" tugmasini bosing va o'sha yangi
echo      "https://....trycloudflare.com/v1" manzilini kiriting!
echo ========================================================
echo.
pause
