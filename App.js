// App.js

import * as React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext'; // 🔑 AuthContext 불러오기

// 🔑 각 화면 컴포넌트 import
import LoginScreen from './src/pages/Auth/login'; 
import SignupScreen from './src/pages/Auth/signup';
import MainScreen from './src/pages/main';

const Stack = createNativeStackNavigator();

// ------------------------------------
// 임시 스플래시(로딩) 화면
// ------------------------------------
function SplashScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={{ marginTop: 10 }}>인증 정보 확인 중...</Text>
    </View>
  );
}

// ------------------------------------
// 인증 관련 화면 스택 (로그인, 회원가입)
// ------------------------------------
const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
);

// ------------------------------------
// 앱 주요 기능 화면 스택 (메인, 녹음)
// ------------------------------------
const AppStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="Home" component={MainScreen} options={{ title: '수면 분석 시작' }} />
    </Stack.Navigator>
);

// ------------------------------------
// 네비게이션 루트
// ------------------------------------
function RootNavigator() {
    const { userToken, isLoading } = React.useContext(AuthContext);

    if (isLoading) {
      return <SplashScreen />;
    }
  
    return (
      <NavigationContainer>
          {userToken == null ? <AuthStack /> : <AppStack />}
      </NavigationContainer>
    );
}

export default function App() {
    return (
        // 앱 전체를 AuthProvider로 감싸서 모든 컴포넌트가 인증 상태에 접근하도록 함
        <AuthProvider>
            <RootNavigator />
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    }
});