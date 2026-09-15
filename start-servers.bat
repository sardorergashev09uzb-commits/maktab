@echo off
title Maktab Platformasi - Serverlar
echo ========================================================
echo         Maktab Platformasini Ishga Tushirish
echo ========================================================
echo.

echo [1/2] PHP REST API (Port 8080) alohida oynada ishga tushirilmoqda...
start "Maktab PHP API (8080)" cmd /k "php -S 127.0.0.1:8080 -t C:\laragon\www\maktab\api\web C:\laragon\www\maktab\api\web\index.php"

echo [2/2] Next.js Frontend (Port 3000) alohida oynada ishga tushirilmoqda...
start "Maktab Next.js Frontend (3000)" cmd /k "cd /d C:\laragon\www\maktab\client && npm run dev"

echo.
echo ========================================================
echo   Ikkala server alohida oynalarda ishga tushirildi!
echo   Next.js oynasida "Ready" yozuvi chiqqach, brauzerda:
echo   http://localhost:3000 yoki http://localhost:3000/login
echo ========================================================
echo.
ping 127.0.0.1 -n 4 > nul
