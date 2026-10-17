@echo off
title Server Game - Thanh Van Kiem Khach
cd /d "%~dp0"

echo ========================================================
echo    KHOI CHAY SERVER GAME NOI BO - THANH VAN KIEM KHACH
echo ========================================================
echo.

set "NODE_EXE=node"
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "NODE_EXE=C:\Program Files\nodejs\node.exe"
    ) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
        set "NODE_EXE=C:\Program Files (x86)\nodejs\node.exe"
    ) else (
        echo [LOI] Khong tim thay Node.js tren may tinh!
        echo Vui long cai dat Node.js tu https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
)

echo [1/2] Dang khoi chay server va mo trinh duyet...
echo [2/2] Nhan phim Ctrl + C de dung server.
echo.

"%NODE_EXE%" server.js --open

echo.
echo Server da dung.
pause

