@echo off
set JAVA_HOME=f:\eGovFrameDev-5.0.0\jdk-21.0.2
set M2_REPO=C:\Users\Administrator\.m2\repository

set CLASSPATH=.
set CLASSPATH=%CLASSPATH%;%M2_REPO%\org\jasypt\jasypt\1.9.3\jasypt-1.9.3.jar

"%JAVA_HOME%\bin\javac" -encoding UTF-8 -cp "%CLASSPATH%" -d . src\main\java\kr\co\bootSample\global\config\JasyptEncryptorMain.java
"%JAVA_HOME%\bin\java" -cp "%CLASSPATH%;." kr.co.bootSample.global.config.JasyptEncryptorMain
