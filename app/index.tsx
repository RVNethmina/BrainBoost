import "../global.css";
import AppNavigator from "./navigation/AppNavigator";
import { SettingsProvider } from "./contexts/SettingsContext";
import { NotificationService } from "@/config/NotificationService";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Initialize notifications when app starts
    const initNotifications = async () => {
      await NotificationService.initialize();
      console.log('✅ Notifications initialized in app');
    };
    
    initNotifications();
  }, []);

  return (
    <SettingsProvider>
      <AppNavigator />
    </SettingsProvider>
  );
};

export default Index;