import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.worxstr.app',
  appName: 'Worxstr',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  },
  cordova: {},
  server: {
    hostname: "worxstr.com",
<<<<<<< HEAD
    "url": "http://192.168.86.29:8080",
    "cleartext": true
=======
<<<<<<< Updated upstream
    // "url": "http://192.168.86.42:8080",
=======
    // "url": "http://192.168.86.24:8080",
>>>>>>> Stashed changes
    // "cleartext": true
>>>>>>> d4c81ea34c92a53d9ac84989b3815ca275e3dc6a
  }
};

export default config;
