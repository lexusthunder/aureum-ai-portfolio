import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'ai.aureum.crm',
  appName: 'Aureum CRM',
  webDir: 'dist',
  // Backend URL — schimbă cu URL-ul tău de producție sau ngrok
  server: {
    // În development cu backend local, uncomment:
    // url: 'http://localhost:8000',
    // allowNavigation: ['localhost', '*.supabase.co'],
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'aureum.crm',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#030712',   // gray-950 (același cu app-ul web)
    preferredContentMode: 'desktop',
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#030712',
      iosSpinnerStyle: 'large',
      spinnerColor: '#F59E0B',    // amber-500
      showSpinner: true,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#030712',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#F59E0B',
    },
    Browser: {
      limitsNavigationsToAppBoundDomains: true,
    },
  },
}

export default config
