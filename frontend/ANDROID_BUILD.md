# Android APK

## Requirements

- Node.js and npm
- Android Studio with the Android SDK installed
- JDK 21 (set Android Studio's **Gradle JDK** to this JDK; the bundled JDK 25 is not compatible with this Android Gradle plugin)

## Prepare the Android project

From the `frontend` directory, run:

```powershell
npm install
npm run build:android
npm run android:open
```

In Android Studio, set **File > Settings > Build, Execution, Deployment > Build Tools > Gradle > Gradle JDK** to JDK 21, then wait for Gradle sync to finish and choose **Build > Build Bundle(s) / APK(s) > Build APK(s)**. Android Studio shows the APK location when the build completes; the debug APK is normally under `android/app/build/outputs/apk/debug/`.

The app bundles the frontend for offline startup and connects to the configured production API for products, accounts, and settings.
