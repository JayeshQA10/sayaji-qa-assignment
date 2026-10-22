# ADB command reference

Replace `com.example.app` with the actual package name.

## Connectivity

```bash
adb shell svc wifi disable
adb shell svc data disable
adb shell svc wifi enable
adb shell dumpsys connectivity
```

## Logs

```bash
adb logcat -c
adb logcat -v threadtime | grep -i -E "sync|workmanager|okhttp|retrofit|upload|error"
```

## Memory

```bash
adb shell dumpsys meminfo com.example.app
adb shell dumpsys activity processes | grep com.example.app
adb shell dumpsys cpuinfo | head -30
adb shell dumpsys gfxinfo com.example.app
```

## Storage

```bash
adb shell df -h /data
adb shell df -h /sdcard
adb shell du -h /data/user/0/com.example.app | tail
```

## Work scheduling diagnostics

```bash
adb shell dumpsys jobscheduler
adb logcat | grep -i WorkManager
```

## Debug-build Room inspection

```bash
adb shell run-as com.example.app ls -la databases
adb shell run-as com.example.app "cp databases/app.db /sdcard/app.db"
adb pull /sdcard/app.db
sqlite3 app.db ".tables"
sqlite3 app.db "SELECT * FROM survey;"
```

`run-as` is not guaranteed for a production/non-debuggable APK. In that case use an approved QA build, diagnostic export, or Android Studio Database Inspector.
