import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.honda.valueinsight',
  appName: 'Honda Value Insight',
  webDir: 'dist/client',
  server: {
    androidScheme: 'https'
  }
};

export default config;
