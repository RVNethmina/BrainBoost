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

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');
  const [memberSince, setMemberSince] = useState('');
  
  // Temporary state for edit mode
  const [editName, setEditName] = useState('');
  const [editBirthday, setEditBirthday] = useState('');
  const [editPhone, setEditPhone] = useState('');

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
      // Entering edit mode - copy current values to edit state
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

      // Update local state
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
    // Reset edit values to current values
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
      <View style={[styles.page, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={PALETTE.teal} />
        <Text style={{ marginTop: 12, color: '#666' }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: PALETTE.lightPink }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.headerBtn, { backgroundColor: PALETTE.lightTeal }]}
          accessibilityLabel="Go back"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.headerBtnText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile</Text>

        <TouchableOpacity onPress={toggleEditMode} accessibilityLabel={isEditMode ? "Cancel edit" : "Edit profile"}>
          <Text style={styles.editText}>{isEditMode ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isEditMode ? (
          <>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, { backgroundColor: PALETTE.lightTeal }]}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
              <Text style={styles.nameText}>{name}</Text>
              <Text style={styles.memberText}>
                {calculateAge() ? `Age ${calculateAge()} • ` : ''}
                {memberSince ? `Member since ${memberSince}` : 'New Member'}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>📧 Email</Text>
              <Text style={styles.cardValue}>{email || 'Not available'}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>🎂 Birthday</Text>
              <Text style={styles.cardValue}>{formatBirthday()}</Text>
            </View>

            {phone && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>📱 Phone</Text>
                <Text style={styles.cardValue}>{phone}</Text>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardLabel}>🏆 Achievements</Text>
              <Text style={styles.cardValue}>15 badges earned</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>📊 Statistics</Text>
              <Text style={styles.cardValue}>View detailed stats</Text>
            </View>

            <TouchableOpacity
              style={[styles.actionBtnOutline, { borderColor: PALETTE.lightTeal }]}
              onPress={confirmSignOut}
              accessibilityLabel="Sign out"
            >
              <Text style={styles.actionBtnOutlineText}>🚪 Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.avatarWrap}>
              <TouchableOpacity style={[styles.avatarLarge, { backgroundColor: PALETTE.lightTeal }]} accessibilityLabel="Change photo">
                <Text style={styles.avatarEmojiLarge}>👤</Text>
              </TouchableOpacity>
              <Text style={styles.smallHint}>Tap to change photo</Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.inputLabel}>👤 Full Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Full name"
                placeholderTextColor="#666"
                accessibilityLabel="Full name"
              />

              <Text style={styles.inputLabel}>📧 Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#f5f5f5' }]}
                value={email}
                editable={false}
                placeholder="Email"
                placeholderTextColor="#666"
                accessibilityLabel="Email (cannot be changed)"
              />
              <Text style={styles.smallHint}>Email cannot be changed</Text>

              <Text style={styles.inputLabel}>🎂 Birthday</Text>
              <TextInput
                style={styles.input}
                value={editBirthday}
                onChangeText={setEditBirthday}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#666"
                accessibilityLabel="Birthday"
              />

              <Text style={styles.inputLabel}>📱 Phone (optional)</Text>
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                placeholder="Phone number"
                placeholderTextColor="#666"
                accessibilityLabel="Phone number"
              />
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={cancelEdit}
                accessibilityLabel="Cancel editing"
              >
                <Text style={styles.cancelBtnText}>❌ Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: PALETTE.teal }]}
                onPress={saveProfile}
                accessibilityLabel="Save profile"
              >
                <Text style={styles.saveBtnText}>✅ Save</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#ffffff" },
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
  headerBtnText: { fontSize: 22 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#333" },
  editText: { color: "#6A0DAD", fontWeight: "700" },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  avatarWrap: { alignItems: "center", marginBottom: 18 },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  avatarEmoji: { fontSize: 36 },
  nameText: { fontSize: 22, fontWeight: "800", marginTop: 12 },
  memberText: { color: "#666", marginTop: 6 },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PALETTE.lightTeal,
  },
  cardLabel: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  cardValue: { fontSize: 16, color: "#444" },

  actionBtnOutline: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
  },
  actionBtnOutlineText: { fontSize: 18, fontWeight: "700", color: "#444" },

  // Edit mode
  avatarLarge: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
  avatarEmojiLarge: { fontSize: 44 },
  smallHint: { marginTop: 8, color: "#666", fontSize: 14 },

  form: { marginTop: 8 },
  inputLabel: { fontSize: 16, marginTop: 12, fontWeight: "700", color: "#333" },
  input: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.lightTeal,
    backgroundColor: "#fff",
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
  cancelBtn: { borderWidth: 2, borderColor: PALETTE.lightTeal, backgroundColor: "#fff" },
  cancelBtnText: { fontSize: 18, fontWeight: "700", color: "#444" },
  saveBtnText: { fontSize: 18, fontWeight: "700", color: "#fff" },
});

export default ProfileScreen;