import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type ProgressScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Progress'
>;

const ProgressScreen = () => {
  const navigation = useNavigation<ProgressScreenNavigationProp>();

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-10 pb-4 bg-purple-100">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="items-center justify-center w-12 h-12 bg-gray-100 rounded-xl"
        >
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">My Progress</Text>
        <View className="w-12" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="grid grid-cols-2 gap-4 mt-6">
          <View className="items-center p-5 bg-yellow-100 rounded-2xl">
            <Text className="mb-2 text-3xl">🎮</Text>
            <Text className="text-lg font-bold">Games Played</Text>
            <Text className="text-2xl font-bold text-purple-600">127</Text>
          </View>
          
          <View className="items-center p-5 bg-yellow-100 rounded-2xl">
            <Text className="mb-2 text-3xl">🔥</Text>
            <Text className="text-lg font-bold">Streak</Text>
            <Text className="text-2xl font-bold text-orange-600">12 days</Text>
          </View>
        </View>

        {/* Weekly Progress */}
        <View className="p-5 mt-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <Text className="mb-4 text-xl font-bold">Weekly Progress</Text>
          <View className="flex-row items-end justify-between h-32 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <View key={day} className="flex-col items-center">
                <View 
                  className="w-8 bg-purple-300 rounded-t" 
                  style={{ 
                    height: [60, 80, 100, 75, 120, 40, 90][index],
                    backgroundColor: index === 4 ? '#8b5cf6' : index === 2 ? '#a855f7' : '#d8b4fe'
                  }}
                />
                <Text className="mt-2 text-sm">{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Achievements */}
        <View className="p-5 mt-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <Text className="mb-4 text-xl font-bold">Recent Achievements</Text>
          <View className="space-y-3">
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">🏆</Text>
              <View>
                <Text className="font-semibold">Memory Master</Text>
                <Text className="text-sm text-gray-600">Completed 10 memory games</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">⭐</Text>
              <View>
                <Text className="font-semibold">Perfect Score</Text>
                <Text className="text-sm text-gray-600">Got 100% in math game</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProgressScreen;