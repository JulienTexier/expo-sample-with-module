# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Prebuild the app

   ```bash
   npm run prebuild
   ```

   This command will create the `android` and `ios` directories, which are required for building the app for Android and iOS.

3. Start the Android app

   ```bash
   npm run android
   ```

4. Start the iOS app

   Before running the iOS app, you need to manually add the required HsM libraries. Follow these steps:

   - Open the `ios` directory in Xcode by running the following command from the root of the project:

     ```bash
     xed ios/
     ```

   - In Xcode, navigate to `File > Add Package Dependencies`. Then:
     - Add the package to the project: `Pods`
     - Add the package to the target: `LindstromHsmBasetypes`

   Once the dependencies are added, you can run the app:

   ```bash
   npm run ios
   ```

   Alternatively, you can build and run the app directly from Xcode.

> [!IMPORTANT]  
> The Communications library currentlty does not work. To test the BaseTypes one, comment out the entire `ble-communications.tsx` file in the `app` directory. This will allow you to run the app without any issues.

> [!IMPORTANT]  
> Whenever you make native changes, you must run the prebuild command and rebuild your apps.

In the output, you'll find options to open the app in a:

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
