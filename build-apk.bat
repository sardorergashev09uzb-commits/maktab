@echo off
title Maktab Mobile - APK Yig'ish (EAS Build)
echo ========================================================
echo        Maktab Mobil Ilovasi - Mustaqil APK Yig'ish
echo ========================================================
echo.
echo DIQQAT: APK yig'ishdan oldin:
echo 1. https://expo.dev saytidan bepul ro'yxatdan o'tgan bo'lishingiz kerak.
echo 2. Agar hali login qilmagan bo'lsangiz, birinchi marta:
echo    "npx eas login" buyrug'i so'raladi.
echo.
echo ========================================================
echo.
cd /d C:\laragon\www\maktab\mobile

echo [1/2] EAS tizimiga ulanish tekshirilmoqda...
call npx eas-cli whoami
if %errorlevel% neq 0 (
    echo.
    echo Iltimos, Expo akkauntingiz login va parolini kiriting:
    call npx eas-cli login
)

echo.
echo [2/2] Bulutda mustaqil Android APK yig'ish boshlanmoqda...
echo Bu jarayon 5-10 daqiqa vaqt olishi mumkin.
echo Tayyor bo'lgach, ekranda APK yuklab olish havolasi chiqadi!
echo.
call npx eas-cli build -p android --profile preview

pause
