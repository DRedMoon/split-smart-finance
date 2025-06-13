
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0069019afc584f27a29ca4e489a74e92',
  appName: 'split-smart-finance',
  webDir: 'dist',
  server: {
    url: 'https://0069019a-fc58-4f27-a29c-a4e489a74e92.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
