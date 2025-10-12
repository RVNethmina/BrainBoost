// app/contexts/SettingsContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Audio } from "expo-av";
import backgroundMusicFile from "../../assets/sounds/background-music.mp3";

export type TextSize = "small" | "medium" | "large" | "extra-large";
export type Theme = "light" | "dark";

interface SettingsContextType {
  // Settings state
  backgroundMusic: boolean;
  notifications: boolean;
  textSize: TextSize;
  theme: Theme;

  // Settings updaters
  setBackgroundMusic: (value: boolean) => Promise<void>;
  setNotifications: (value: boolean) => Promise<void>;
  setTextSize: (value: TextSize) => Promise<void>;
  setTheme: (value: Theme) => Promise<void>;

  // Utility functions
  getTextSizeValue: () => number;
  getFontScale: () => number;
}

const STORAGE_KEYS = {
  BACKGROUND_MUSIC: "@settings_background_music",
  NOTIFICATIONS: "@settings_notifications",
  TEXT_SIZE: "@settings_text_size",
  THEME: "@settings_theme",
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

// Background music sound object (module level)
let backgroundMusicSound: Audio.Sound | null = null;

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [backgroundMusic, setBackgroundMusicState] = useState(false);
  const [notifications, setNotificationsState] = useState(true);
  const [textSize, setTextSizeState] = useState<TextSize>("medium");
  const [theme, setThemeState] = useState<Theme>("light");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load all settings on mount
  useEffect(() => {
    loadAllSettings();
    setupAudio();

    return () => {
      // Cleanup audio on unmount
      if (backgroundMusicSound) {
        backgroundMusicSound.unloadAsync();
      }
    };
  }, []);

  // Handle background music playback when setting changes
  useEffect(() => {
    if (isLoaded) {
      if (backgroundMusic) {
        playBackgroundMusic();
      } else {
        stopBackgroundMusic();
      }
    }
  }, [backgroundMusic, isLoaded]);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error("Error setting up audio:", error);
    }
  };

  const loadAllSettings = async () => {
    try {
      const [savedMusic, savedNotifications, savedTextSize, savedTheme] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.BACKGROUND_MUSIC),
          AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.TEXT_SIZE),
          AsyncStorage.getItem(STORAGE_KEYS.THEME),
        ]);

      if (savedMusic !== null) setBackgroundMusicState(JSON.parse(savedMusic));
      if (savedNotifications !== null)
        setNotificationsState(JSON.parse(savedNotifications));
      if (savedTextSize !== null) setTextSizeState(savedTextSize as TextSize);
      if (savedTheme !== null) setThemeState(savedTheme as Theme);

      setIsLoaded(true);
    } catch (error) {
      console.error("Error loading settings:", error);
      setIsLoaded(true);
    }
  };

  const playBackgroundMusic = async () => {
    try {
      // If already playing, don't restart
      if (backgroundMusicSound) {
        const status = await backgroundMusicSound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          return;
        }
      }

      // Unload previous sound if exists
      if (backgroundMusicSound) {
        await backgroundMusicSound.unloadAsync();
      }

      // Load and play new sound
      // Using a royalty-free background music URL
      // You should replace this with your own music file
      const { sound } = await Audio.Sound.createAsync(
        // Option 1: Use a local file (recommended)

        backgroundMusicFile,
        {
          shouldPlay: true,
          isLooping: true,
          volume: 0.3,
        }

        // Option 2: Use a remote URL (for demo)
        // { uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        // {
        //   shouldPlay: true,
        //   isLooping: true,
        //   volume: 0.3, // 30% volume for background
        // }
      );

      backgroundMusicSound = sound;
      console.log("🎵 Background music started");
    } catch (error) {
      console.error("Error playing background music:", error);
    }
  };

  const stopBackgroundMusic = async () => {
    try {
      if (backgroundMusicSound) {
        await backgroundMusicSound.stopAsync();
        console.log("🔇 Background music stopped");
      }
    } catch (error) {
      console.error("Error stopping background music:", error);
    }
  };

  const setBackgroundMusic = async (value: boolean) => {
    setBackgroundMusicState(value);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.BACKGROUND_MUSIC,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error("Error saving background music setting:", error);
    }
  };

  const setNotifications = async (value: boolean) => {
    setNotificationsState(value);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error("Error saving notifications setting:", error);
    }
  };

  const setTextSize = async (value: TextSize) => {
    setTextSizeState(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TEXT_SIZE, value);
    } catch (error) {
      console.error("Error saving text size setting:", error);
    }
  };

  const setTheme = async (value: Theme) => {
    setThemeState(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, value);
    } catch (error) {
      console.error("Error saving theme setting:", error);
    }
  };

  // Get font size value based on text size setting
  const getTextSizeValue = (): number => {
    switch (textSize) {
      case "small":
        return 0.85;
      case "medium":
        return 1;
      case "large":
        return 1.15;
      case "extra-large":
        return 1.3;
      default:
        return 1;
    }
  };

  // Get font scale multiplier
  const getFontScale = (): number => {
    return getTextSizeValue();
  };

  const value: SettingsContextType = {
    backgroundMusic,
    notifications,
    textSize,
    theme,
    setBackgroundMusic,
    setNotifications,
    setTextSize,
    setTheme,
    getTextSizeValue,
    getFontScale,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use settings
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
