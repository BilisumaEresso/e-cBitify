@echo off
REM Start backend server
REM This opens a new window to keep the server running

cd /d "C:\Users\billy\Desktop\New folder (2)\ecommerce\backend"
echo.
echo ====================================
echo Starting Backend Server...
echo ====================================
echo.
echo Waiting for dependencies...
npm start
