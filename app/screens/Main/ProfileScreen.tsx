import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

const PALETTE = {
  red: "#F04F4E",
  teal: "#639D9D",
  lightTeal: "#92BABA",
  orange: "#F3A421",
  lightPink: "#FBD4D3",
};

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState('Margaret Johnson');
  const [email, setEmail] = useState('margaret.j@email.com');
  const [birthday, setBirthday] = useState('1952-03-15');
  const [phone, setPhone] = useState('');

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const saveProfile = () => {
    // Save profile logic here
    setIsEditMode(false);
  };

  const cancelEdit = () => {
    // Reset form values
    setName('Margaret Johnson');
    setEmail('margaret.j@email.com');
    setBirthday('1952-03-15');
    setPhone('');
    setIsEditMode(false);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-10 pb-4" style={{ backgroundColor: PALETTE.lightPink }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="items-center justify-center w-12 h-12 rounded-xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
        >
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Profile</Text>
        <TouchableOpacity onPress={toggleEditMode}>
          <Text className="font-semibold text-purple-600">{isEditMode ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {!isEditMode ? (
          // View Mode
          <>
            <View className="items-center my-8">
              <View className="items-center justify-center w-24 h-24 rounded-full" style={{ backgroundColor: PALETTE.lightTeal }}>
                <Text className="text-4xl">👤</Text>
              </View>
              <Text className="mt-4 text-2xl font-bold">{name}</Text>
              <Text className="text-gray-600">Age 72 • Member since 2024</Text>
            </View>

            <View className="space-y-4">
              <View className="p-5 bg-white border shadow-sm rounded-2xl" style={{ borderColor: PALETTE.lightTeal }}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <Text className="text-2xl">📧</Text>
                    <View>
                      <Text className="font-semibold">Email</Text>
                      <Text className="text-gray-600">{email}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="p-5 bg-white border shadow-sm rounded-2xl" style={{ borderColor: PALETTE.lightTeal }}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <Text className="text-2xl">🎂</Text>
                    <View>
                      <Text className="font-semibold">Birthday</Text>
                      <Text className="text-gray-600">March 15, 1952</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="p-5 bg-white border shadow-sm rounded-2xl" style={{ borderColor: PALETTE.lightTeal }}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <Text className="text-2xl">🏆</Text>
                    <View>
                      <Text className="font-semibold">Achievements</Text>
                      <Text className="text-gray-600">15 badges earned</Text>
                    </View>
                  </View>
                  <Text className="text-2xl">→</Text>
                </View>
              </View>

              <View className="p-5 bg-white border shadow-sm rounded-2xl" style={{ borderColor: PALETTE.lightTeal }}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <Text className="text-2xl">📊</Text>
                    <View>
                      <Text className="font-semibold">Statistics</Text>
                      <Text className="text-gray-600">View detailed stats</Text>
                    </View>
                  </View>
                  <Text className="text-2xl">→</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              className="flex-row items-center justify-center px-6 py-4 mt-8 mb-8 border rounded-xl"
              style={{ borderColor: PALETTE.lightTeal }}
            >
              <Text className="mr-2 text-lg">🚪</Text>
              <Text className="font-semibold text-gray-700">Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Edit Mode
          <>
            <View className="items-center my-6">
              <TouchableOpacity className="items-center justify-center w-20 h-20 rounded-full" style={{ backgroundColor: PALETTE.lightTeal }}>
                <Text className="text-3xl">👤</Text>
              </TouchableOpacity>
              <Text className="mt-2 text-sm text-gray-500">Tap to change photo</Text>
            </View>

            <View className="pb-6 space-y-5">
              <View>
                <Text className="mb-2 text-lg font-semibold text-gray-700">👤 Full Name</Text>
                <TextInput
                  className="p-4 text-lg border rounded-xl"
                  style={{ borderColor: PALETTE.lightTeal }}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View>
                <Text className="mb-2 text-lg font-semibold text-gray-700">📧 Email</Text>
                <TextInput
                  className="p-4 text-lg border rounded-xl"
                  style={{ borderColor: PALETTE.lightTeal }}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text className="mb-2 text-lg font-semibold text-gray-700">🎂 Birthday</Text>
                <TextInput
                  className="p-4 text-lg border rounded-xl"
                  style={{ borderColor: PALETTE.lightTeal }}
                  value={birthday}
                  onChangeText={setBirthday}
                />
              </View>

              <View>
                <Text className="mb-2 text-lg font-semibold text-gray-700">📱 Phone (Optional)</Text>
                <TextInput
                  className="p-4 text-lg border rounded-xl"
                  style={{ borderColor: PALETTE.lightTeal }}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="Enter phone number"
                />
              </View>
            </View>

            <View className="flex-row gap-3 pt-3 mt-4 border-t" style={{ borderColor: PALETTE.lightTeal }}>
              <TouchableOpacity 
                className="flex-row items-center justify-center flex-1 gap-2 px-4 py-3 border-2 rounded-xl"
                style={{ borderColor: PALETTE.lightTeal }}
                onPress={cancelEdit}
              >
                <Text className="text-xl">❌</Text>
                <Text className="text-lg font-semibold text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-row items-center justify-center flex-1 gap-2 px-4 py-3 rounded-xl"
                style={{ backgroundColor: PALETTE.teal }}
                onPress={saveProfile}
              >
                <Text className="text-xl">✅</Text>
                <Text className="text-lg font-semibold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;