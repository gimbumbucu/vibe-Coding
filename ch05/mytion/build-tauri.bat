@echo off
set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"
set "CARGO_TARGET_DIR=C:\cargo-target\mytion"
npm run tauri:build
