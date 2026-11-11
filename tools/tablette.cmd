@echo off
rem Tablette virtuelle (Pixel Tablet, Android 37) pour essayer l'APK sans tablette.
rem Usage : tools\tablette.cmd            installe le dernier APK de livrables\
rem         tools\tablette.cmd x.y.z      installe livrables\Nuki-Town-x.y.z.apk
setlocal
set SDK=%LOCALAPPDATA%\Android\Sdk
if defined ANDROID_HOME set SDK=%ANDROID_HOME%
set ADB=%SDK%\platform-tools\adb.exe
cd /d "%~dp0.."

if "%~1"=="" (
  for /f "delims=" %%f in ('dir /b /o:d livrables\Nuki-Town-*.apk') do set APK=livrables\%%f
) else (
  set APK=livrables\Nuki-Town-%~1.apk
)
echo APK : %APK%

"%ADB%" get-state >nul 2>&1
if not errorlevel 1 goto ready
echo Demarrage de la tablette virtuelle, 1 a 2 minutes...
start "" "%SDK%\emulator\emulator.exe" -avd Tablette_Neutron -no-snapshot-save -gpu auto
"%ADB%" wait-for-device
:boot
rem Android answers "1" followed by a carriage return: findstr ignores it.
"%ADB%" shell getprop sys.boot_completed 2>nul | findstr /b "1" >nul && goto ready
ping -n 4 127.0.0.1 >nul
goto boot
:ready
"%ADB%" install -r "%APK%"
"%ADB%" shell monkey -p fr.neutroncity.jeu -c android.intent.category.LAUNCHER 1 >nul 2>&1
echo Le jeu est lance dans la tablette virtuelle.
