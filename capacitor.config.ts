import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.worxstr.app',
  appName: 'Worxstr',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      androidScaleType: 'CENTER_INSIDE',
      // showSpinner: true,
      backgroundColor: '#e7edf7'
    }
  },
  cordova: {},
  server: {
    hostname: "worxstr.com",
    // "url": "http://192.168.86.25:8080",
    // "cleartext": true
  }
};

export default config;
