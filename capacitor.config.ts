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
<<<<<<< Updated upstream
    // "url": "http://192.168.86.42:8080",
=======
    // "url": "http://192.168.86.24:8080",
>>>>>>> Stashed changes
    // "cleartext": true
  }
};

export default config;
