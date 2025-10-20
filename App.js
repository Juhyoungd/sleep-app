// App.js (앱의 시작점)

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 🔑 중요: 각 페이지 파일을 정확한 경로로 불러옵니다.
// './src/pages/Auth/' 경로는 당신의 파일 구조에 맞춰졌습니다.
import { LoginScreen } from './src/pages/Auth/login'; 
import SignupScreen from './src/pages/Auth/signup'; // 회원가입 화면 (이 파일도 만들어야 합니다)
import MainScreen from './src/pages/main'; // 메인 홈 화면 (이 파일도 만들어야 합니다)

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        // 앱을 시작했을 때 가장 먼저 보여줄 화면을 'Login'으로 설정
        initialRouteName="Login"
      >
        {/* 1. 'Login' 화면 등록 (실제 폼이 있는 화면) */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: '로그인', headerShown: false }} // 헤더바 숨김
        />
        
        {/* 2. 'Signup' 화면 등록 */}
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen} 
          options={{ title: '회원가입' }} 
        />
        
        {/* 3. 'Home' 화면 등록 */}
        <Stack.Screen 
          name="Home" 
          component={MainScreen} 
          options={{ title: '수면 분석 시작' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}