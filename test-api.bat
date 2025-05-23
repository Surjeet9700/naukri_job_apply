@echo off
:: Test script for Naukri API server on Windows
setlocal enabledelayedexpansion

:: Colors for output
set GREEN=[32m
set RED=[31m
set YELLOW=[33m
set NC=[0m

:: Load variables from .env file if it exists
if exist .env (
  echo %GREEN%Loading credentials from .env file%NC%
  for /F "tokens=*" %%i in (.env) do (
    set line=%%i
    if "!line:~0,1!" NEQ "#" (
      set !line!
    )
  )
)

:: Set default port
if "%PORT%"=="" set PORT=3000
set API_URL=http://localhost:%PORT%

:: Check if server is running
echo %YELLOW%Checking if API server is running on port %PORT%...%NC%
curl -s %API_URL% > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo %RED%API server is not running. Start it with 'npm start' in another terminal.%NC%
  exit /b 1
)

echo %GREEN%API server is running!%NC%

:: Prompt for credentials if not set in .env
if "%EMAIL%"=="" (
  set /p EMAIL=Enter your Naukri email: 
)

if "%PASSWORD%"=="" (
  set /p PASSWORD=Enter your Naukri password: 
)

:: Prompt for job URL
set /p JOB_URL=Enter the job URL to apply for: 

if "%JOB_URL%"=="" (
  echo %RED%Job URL is required%NC%
  exit /b 1
)

:: Show request details
echo %YELLOW%Making request to:%NC%
echo %API_URL%/apply?email=%EMAIL%^&password=********^&jobUrl=%JOB_URL%

:: Make the request
echo %YELLOW%Processing...%NC%
curl -s "%API_URL%/apply?email=%EMAIL%&password=%PASSWORD%&jobUrl=%JOB_URL%"

if %ERRORLEVEL% EQU 0 (
  echo %GREEN%Test completed!%NC%
) else (
  echo %RED%Request failed!%NC%
)

endlocal
