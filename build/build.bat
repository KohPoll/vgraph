@echo off

echo build the project(use the r.js of RequireJS).
node r.js -o ..\app\app.build.js

echo compress css file...
for /r ..\app-build\css %%i in (*.css) do (
    java -jar yuicompressor.jar --charset UTF8 -o "%%i" "%%i"
    echo compress:%%i
)

echo compress js file...
for /r ..\app-build\js %%i in (*.js) do (
    java -jar yuicompressor.jar --charset UTF8 -o "%%i" "%%i"
    echo compress:%%i
)