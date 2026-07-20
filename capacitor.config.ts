import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.honda.valueinsight',
  appName: 'Honda Value Insight',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // Route fetch/XHR (axios) through native HTTP so calls to the plain-HTTP
    // API endpoint aren't blocked by the WebView's mixed-content policy
    // (the app is served from the https://localhost origin).
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
