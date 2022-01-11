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
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  cordova: {},
  server: {
    hostname: "worxstr.com",
<<<<<<< HEAD
    // "url": "http://192.168.86.41:8080",
    // "cleartext": true
=======
    "url": "http://192.168.86.27:8080",
    "cleartext": true
>>>>>>> 08d3092f66ff4e333dd42f4de6431535e6dd0632
  }
};

export default config;
