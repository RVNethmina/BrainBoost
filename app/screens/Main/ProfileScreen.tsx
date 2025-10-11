// app/src/screens/Main/ProfileScreen.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { auth, firestore } from '../../../config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useSettings } from "@/app/contexts/SettingsContext";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');
  const [memberSince, setMemberSince] = useState('');
  
  const [editName, setEditName] = useState('');
  const [editBirthday, setEditBirthday] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Dynamic colors
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#fff' : '#333';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const headerBg = isDark ? '#2a2a2a' : PALETTE.lightPink;
  const inputBg = isDark ? '#3a3a3a' : '#fff';
  const inputBorder = isDark ? '#4a4a4a' : PALETTE.lightTeal;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigation.reset({ index: 0, routes: [{ name: "Welcome" as any }] });
        return;
      }

      setEmail(user.email || '');

      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const displayName = data.displayName || user.email?.split("@")[0] || 'User';
        setName(displayName);
        setBirthday(data.birthday || '');
        setPhone(data.phone || '');
        
        if (data.createdAt) {
          const year = new Date(data.createdAt).getFullYear();
          setMemberSince(year.toString());
        }
      } else {
        setName(user.email?.split("@")[0] || 'User');
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load profile data.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEditMode = () => {
    if (!isEditMode) {
      setEditName(name);
      setEditBirthday(birthday);
      setEditPhone(phone);
    }
    setIsEditMode(prev => !prev);
  };

  const saveProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(firestore, "users", user.uid);
      await updateDoc(userDocRef, {
        displayName: editName,
        birthday: editBirthday,
        phone: editPhone,
      });

      setName(editName);
      setBirthday(editBirthday);
      setPhone(editPhone);
      
      setIsEditMode(false);
      Alert.alert("Saved", "Your profile has been updated.");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  const cancelEdit = () => {
    setEditName(name);
    setEditBirthday(birthday);
    setEditPhone(phone);
    setIsEditMode(false);
  };

  const confirmSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Do you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.reset({ index: 0, routes: [{ name: "Welcome" as any }] });
            } catch (error) {
              console.error("Error signing out:", error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const calculateAge = () => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatBirthday = () => {
    if (!birthday) return 'Not set';
    const date = new Date(birthday);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <View style={[styles.page, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={PALETTE.teal} />
        <Text style={{ marginTop: 12, fontSize: 16 * fontScale, color: isDark ? '#aaa' : '#666' }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.page, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.headerBtn, { backgroundColor: PALETTE.lightTeal }]}
          accessibilityLabel="Go back"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.headerBtnText, { fontSize: 22 * fontScale }]}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { fontSize: 22 * fontScale, color: textColor }]}>
          Profile
        </Text>

        <TouchableOpacity onPress={toggleEditMode} accessibilityLabel={isEditMode ? "Cancel edit" : "Edit profile"}>
          <Text style={[styles.editText, { fontSize: 16 * fontScale }]}>
            {isEditMode ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isEditMode ? (
          <>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, { backgroundColor: PALETTE.lightTeal }]}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
              <Text style={[styles.nameText, { fontSize: 22 * fontScale, color: textColor }]}>
                {name}
              </Text>
              <Text style={[styles.memberText, { fontSize: 14 * fontScale, color: isDark ? '#aaa' : '#666' }]}>
                {calculateAge() ? `Age ${calculateAge()} • ` : ''}
                {memberSince ? `Member since ${memberSince}` : 'New Member'}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: cardBg, borderColor: inputBorder }]}>
              <Text style={[styles.cardLabel, { fontSize: 18 * fontScale, color: textColor }]}>
                📧 Email
              </Text>
              <Text style={[styles.cardValue, { fontSize: 16 * fontScale, color: isDark ? '#ccc' : '#444' }]}>
                {email || 'Not available'}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: cardBg, borderColor: inputBorder }]}>
              <Text style={[styles.cardLabel, { fontSize: 18 * fontScale, color: textColor }]}>
                🎂 Birthday
              </Text>
              <Text style={[styles.cardValue, { fontSize: 16 * fontScale, color: isDark ? '#ccc' : '#444' }]}>
                {formatBirthday()}
              </Text>
            </View>

            {phone && (
              <View style={[styles.card, { backgroundColor: cardBg, borderColor: inputBorder }]}>
                <Text style={[styles.cardLabel, { fontSize: 18 * fontScale, color: textColor }]}>
                  📱 Phone
                </Text>
                <Text style={[styles.cardValue, { fontSize: 16 * fontScale, color: isDark ? '#ccc' : '#444' }]}>
                  {phone}
                </Text>
              </View>
            )}

            <View style={[styles.card, { backgroundColor: cardBg, borderColor: inputBorder }]}>
              <Text style={[styles.cardLabel, { fontSize: 18 * fontScale, color: textColor }]}>
                🏆 Achievements
              </Text>
              <Text style={[styles.cardValue, { fontSize: 16 * fontScale, color: isDark ? '#ccc' : '#444' }]}>
                15 badges earned
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: cardBg, borderColor: inputBorder }]}>
              <Text style={[styles.cardLabel, { fontSize: 18 * fontScale, color: textColor }]}>
                📊 Statistics
              </Text>
              <Text style={[styles.cardValue, { fontSize: 16 * fontScale, color: isDark ? '#ccc' : '#444' }]}>
                View detailed stats
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.actionBtnOutline, { borderColor: PALETTE.lightTeal }]}
              onPress={confirmSignOut}
              accessibilityLabel="Sign out"
            >
              <Text style={[styles.actionBtnOutlineText, { fontSize: 18 * fontScale, color: textColor }]}>
                🚪 Sign Out
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.avatarWrap}>
              <TouchableOpacity 
                style={[styles.avatarLarge, { backgroundColor: PALETTE.lightTeal }]} 
                accessibilityLabel="Change photo"
              >
                <Text style={styles.avatarEmojiLarge}>👤</Text>
              </TouchableOpacity>
              <Text style={[styles.smallHint, { fontSize: 14 * fontScale, color: isDark ? '#aaa' : '#666' }]}>
                Tap to change photo
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={[styles.inputLabel, { fontSize: 16 * fontScale, color: textColor }]}>
                👤 Full Name
              </Text>
              <TextInput
                style={[styles.input, { 
                  fontSize: 18 * fontScale, 
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: textColor
                }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Full name"
                placeholderTextColor={isDark ? '#666' : '#999'}
                accessibilityLabel="Full name"
              />

              <Text style={[styles.inputLabel, { fontSize: 16 * fontScale, color: textColor }]}>
                📧 Email
              </Text>
              <TextInput
                style={[styles.input, { 
                  fontSize: 18 * fontScale,
                  backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                  borderColor: inputBorder,
                  color: textColor
                }]}
                value={email}
                editable={false}
                placeholder="Email"
                placeholderTextColor={isDark ? '#666' : '#999'}
                accessibilityLabel="Email (cannot be changed)"
              />
              <Text style={[styles.smallHint, { fontSize: 12 * fontScale, color: isDark ? '#aaa' : '#666' }]}>
                Email cannot be changed
              </Text>

              <Text style={[styles.inputLabel, { fontSize: 16 * fontScale, color: textColor }]}>
                🎂 Birthday
              </Text>
              <TextInput
                style={[styles.input, { 
                  fontSize: 18 * fontScale,
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: textColor
                }]}
                value={editBirthday}
                onChangeText={setEditBirthday}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={isDark ? '#666' : '#999'}
                accessibilityLabel="Birthday"
              />

              <Text style={[styles.inputLabel, { fontSize: 16 * fontScale, color: textColor }]}>
                📱 Phone (optional)
              </Text>
              <TextInput
                style={[styles.input, { 
                  fontSize: 18 * fontScale,
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: textColor
                }]}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                placeholder="Phone number"
                placeholderTextColor={isDark ? '#666' : '#999'}
                accessibilityLabel="Phone number"
              />
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn, { borderColor: inputBorder }]}
                onPress={cancelEdit}
                accessibilityLabel="Cancel editing"
              >
                <Text style={[styles.cancelBtnText, { fontSize: 18 * fontScale, color: textColor }]}>
                  ❌ Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: PALETTE.teal }]}
                onPress={saveProfile}
                accessibilityLabel="Save profile"
              >
                <Text style={[styles.saveBtnText, { fontSize: 18 * fontScale }]}>
                  ✅ Save
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnText: {},
  headerTitle: { fontWeight: "800" },
  editText: { color: "#6A0DAD", fontWeight: "700" },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  avatarWrap: { alignItems: "center", marginBottom: 18 },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  avatarEmoji: { fontSize: 36 },
  nameText: { fontWeight: "800", marginTop: 12 },
  memberText: { marginTop: 6 },

  card: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardLabel: { fontWeight: "700", marginBottom: 6 },
  cardValue: {},

  actionBtnOutline: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
  },
  actionBtnOutlineText: { fontWeight: "700" },

  avatarLarge: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
  avatarEmojiLarge: { fontSize: 44 },
  smallHint: { marginTop: 8 },

  form: { marginTop: 8 },
  inputLabel: { marginTop: 12, fontWeight: "700" },
  input: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },

  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  cancelBtn: { borderWidth: 2, backgroundColor: "transparent" },
  cancelBtnText: { fontWeight: "700" },
  saveBtnText: { fontWeight: "700", color: "#fff" },
});

export default ProfileScreen;