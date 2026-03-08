@echo off
REM NanoKVM-USB Launcher
REM This script runs the Electron app from the compiled out/ folder

setlocal enabledelayedexpansion

REM Get the script directory
set SCRIPT_DIR=%~dp0

REM Navigate to desktop folder if needed
if not exist "%SCRIPT_DIR%out\main\index.js" (
    set SCRIPT_DIR=%SCRIPT_DIR%desktop\
)

REM Run electron with the app
"%SCRIPT_DIR%node_modules\.bin\electron.cmd" "%SCRIPT_DIR%out"

endlocal
