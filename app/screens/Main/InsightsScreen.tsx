// screens/InsightsScreen.tsx
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const InsightsScreen = () => {
  const navigation = useNavigation();

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
        <Text className="text-2xl font-bold text-gray-800">Insights</Text>
        <View className="w-12" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Brain Age Card */}
        <View className="items-center p-6 mt-6 bg-yellow-100 rounded-2xl">
          <Text className="mb-3 text-4xl">🧠</Text>
          <Text className="mb-2 text-2xl font-bold">Brain Age</Text>
          <Text className="text-3xl font-bold text-purple-600">65 years</Text>
          <Text className="mt-2 text-gray-600">5 years younger than actual!</Text>
        </View>

        {/* Memory Score */}
        <View className="p-5 mt-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xl">🎯</Text>
            <Text className="text-lg font-bold">Memory Score</Text>
            <Text className="text-xl font-bold text-green-600">85%</Text>
          </View>
          <View className="w-full h-3 mb-2 bg-gray-200 rounded-full">
            <View className="h-full bg-purple-500 rounded-full" style={{ width: '85%' }} />
          </View>
          <Text className="text-sm text-gray-600">Improved by 12% this month</Text>
        </View>

        {/* Attention */}
        <View className="p-5 mt-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xl">⚡</Text>
            <Text className="text-lg font-bold">Attention</Text>
            <Text className="text-xl font-bold text-blue-600">78%</Text>
          </View>
          <View className="w-full h-3 mb-2 bg-gray-200 rounded-full">
            <View className="h-full bg-blue-500 rounded-full" style={{ width: '78%' }} />
          </View>
          <Text className="text-sm text-gray-600">Focus exercises recommended</Text>
        </View>

        {/* Math Skills */}
        <View className="p-5 mt-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xl">🧮</Text>
            <Text className="text-lg font-bold">Math Skills</Text>
            <Text className="text-xl font-bold text-orange-600">92%</Text>
          </View>
          <View className="w-full h-3 mb-2 bg-gray-200 rounded-full">
            <View className="h-full bg-orange-500 rounded-full" style={{ width: '92%' }} />
          </View>
          <Text className="text-sm text-gray-600">Excellent! Above average for age group</Text>
        </View>

        {/* Language */}
        <View className="p-5 mt-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xl">🔤</Text>
            <Text className="text-lg font-bold">Language</Text>
            <Text className="text-xl font-bold text-purple-600">88%</Text>
          </View>
          <View className="w-full h-3 mb-2 bg-gray-200 rounded-full">
            <View className="h-full bg-purple-500 rounded-full" style={{ width: '88%' }} />
          </View>
          <Text className="text-sm text-gray-600">Strong vocabulary skills</Text>
        </View>

        {/* Visual Processing */}
        <View className="p-5 mt-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xl">🎨</Text>
            <Text className="text-lg font-bold">Visual Processing</Text>
            <Text className="text-xl font-bold text-indigo-600">74%</Text>
          </View>
          <View className="w-full h-3 mb-2 bg-gray-200 rounded-full">
            <View className="h-full bg-indigo-500 rounded-full" style={{ width: '74%' }} />
          </View>
          <Text className="text-sm text-gray-600">Try pattern games to improve</Text>
        </View>

        {/* Processing Speed */}
        <View className="p-5 mt-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xl">⏱️</Text>
            <Text className="text-lg font-bold">Processing Speed</Text>
            <Text className="text-xl font-bold text-teal-600">81%</Text>
          </View>
          <View className="w-full h-3 mb-2 bg-gray-200 rounded-full">
            <View className="h-full bg-teal-500 rounded-full" style={{ width: '81%' }} />
          </View>
          <Text className="text-sm text-gray-600">Good reaction time</Text>
        </View>

        {/* Personalized Recommendation */}
        <View className="p-4 mt-4 bg-blue-100 rounded-2xl">
          <View className="flex-row items-center gap-3">
            <Text className="text-2xl">💡</Text>
            <View className="flex-1">
              <Text className="text-lg font-bold">Personalized Recommendation</Text>
              <Text className="text-gray-700">
                Focus on attention and visual processing games this week. Your memory skills are excellent!
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Trend */}
        <View className="p-4 mt-4 mb-8 bg-green-100 rounded-2xl">
          <View className="flex-row items-center gap-3">
            <Text className="text-2xl">📈</Text>
            <View className="flex-1">
              <Text className="text-lg font-bold">Weekly Trend</Text>
              <Text className="text-gray-700">
                Overall cognitive performance up 8% from last week. Keep up the great work!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default InsightsScreen;