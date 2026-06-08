import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zatreides.sovereign',
  appName: 'SOVEREIGN',
  webDir: 'dist',
  ios: {
    scheme: 'SOVEREIGN',
    contentInset: 'always',
    preferredContentMode: 'mobile',
  },
  plugins: {
    StatusBar: {
      style: 'DEFAULT',
      overlaysWebView: true,
    },
    Keyboard: {
      resize: 'native',
    },
  },
};

export default config;
