@echo off
title My Project

echo Opening project in VS Code...
start "" code "%~dp0"

echo Starting Frontend...
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Starting Backend...
start "Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo.
echo Frontend and Backend started!
exit