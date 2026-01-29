@echo off
cd /d f:\eGovFrameDev-5.0.0\workspace-egov\bootSample\frontend
echo Installing dependencies...
npm install react-router-dom axios --save
if %ERRORLEVEL% equ 0 (
    echo Installation successful.
) else (
    echo Installation failed with error level %ERRORLEVEL%.
)
pause
