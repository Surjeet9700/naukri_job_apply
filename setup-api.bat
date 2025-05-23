@echo off
:: Setup and run the Naukri Job Application API
setlocal enabledelayedexpansion

:: Colors for output
set GREEN=[32m
set RED=[31m
set YELLOW=[33m
set NC=[0m

:: Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo %RED%Node.js is required but not installed. Please install Node.js first.%NC%
  echo Visit https://nodejs.org/ to download and install.
  exit /b 1
)

:: Check node version
for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
  set NODE_VER=%%a
  set NODE_VER=!NODE_VER:~1!
)
if !NODE_VER! LSS 16 (
  echo %RED%Node.js 16 or higher is required. You have version !NODE_VER!.%NC%
  echo Please upgrade your Node.js installation.
  exit /b 1
)

:: Print welcome message
echo %GREEN%====================================%NC%
echo %GREEN%Naukri Job Application API Installer%NC%
echo %GREEN%====================================%NC%

:: Check if .env file exists
if not exist .env (
  echo %YELLOW%Creating .env file from example...%NC%
  if exist .env.example (
    copy .env.example .env > nul
    echo %GREEN%.env file created successfully.%NC%
    echo %YELLOW%Please edit the .env file with your credentials before running the API.%NC%
  ) else (
    echo %RED%.env.example file not found. Creating empty .env file...%NC%
    echo EMAIL=your_email@example.com> .env
    echo PASSWORD=your_password>> .env
    echo GEMINI_API_KEY=your_gemini_api_key>> .env
    echo PORT=3000>> .env
    echo %YELLOW%Please edit the .env file with your credentials before running the API.%NC%
  )
)

:: Install dependencies
echo %YELLOW%Installing dependencies...%NC%
call npm install

:: Build the project
echo %YELLOW%Building the project...%NC%
call npm run build

:: Check if build was successful
if %ERRORLEVEL% NEQ 0 (
  echo %RED%Build failed. Please check for errors above.%NC%
  exit /b 1
)

:: Ask if user wants to start the API server
set /p START_SERVER="Do you want to start the API server now? (y/n): "
if /i "%START_SERVER%"=="y" (
  echo %GREEN%Starting API server...%NC%
  echo %YELLOW%Press Ctrl+C to stop the server.%NC%
  call npm start
) else (
  echo %GREEN%Installation complete!%NC%
  echo %YELLOW%To start the API server later, run:%NC%
  echo npm start
)

endlocal
