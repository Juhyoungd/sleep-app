// src/components/bottom-bar.js

import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 

// 🔑 중요: 이 경로의 폴더명(pages)과 파일명(main, ResultScreen)의 대소문자가 정확해야 합니다.
import MainScreen from '../pages/main'; 
import ResultScreen from '../pages/ResultScreen'; 

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="MainTab"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'MainTab') {
            iconName = focused ? 'bed' : 'bed-outline'; 
          } else if (route.name === 'ResultTab') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#fff', // 🔑 활성화된 탭 색상을 흰색으로 변경
        tabBarInactiveTintColor: '#aaa', // 🔑 비활성화된 탭 색상을 회색으로 변경
        headerShown: false,
        // 🔑 하단바 스타일 추가: 배경색을 검은색으로 설정
        tabBarStyle: {
            backgroundColor: '#272727ff', // 어두운 배경색
            borderTopColor: 'transparent', // 상단 구분선 제거 (더 깔끔하게)
        }
      })}
    >
      <Tab.Screen 
        name="MainTab" 
        component={MainScreen} 
        options={{ title: '메인' }} 
      />
      
      <Tab.Screen 
        name="ResultTab" 
        component={ResultScreen} 
        options={{ title: '분석 결과' }} 
      />
    </Tab.Navigator>
  );
}
