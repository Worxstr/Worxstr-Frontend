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
    "url": "http://192.168.86.24:8080",
    "cleartext": true
  }
};

export default config;
