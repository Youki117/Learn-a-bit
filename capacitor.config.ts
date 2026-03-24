import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.youki.learnabit',
  appName: 'Learn a Bit',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
