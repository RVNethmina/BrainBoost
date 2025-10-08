import "../global.css";
import AppNavigator from "./navigation/AppNavigator";
import { SettingsProvider } from "./contexts/SettingsContext";

const Index = () => {
  return (
    <SettingsProvider>
      <AppNavigator />
    </SettingsProvider>
  );
};

export default Index;
