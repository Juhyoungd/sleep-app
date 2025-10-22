// App.js (PreloadingScreen 정의 위치 수정 포함)

import * as React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext'; 

// 🔑 Tab Navigator 및 화면 Import
import BottomTabNavigator from './src/components/bottom-bar'; 
import LoginScreen from './src/pages/Auth/login'; 
import SignupScreen from './src/pages/Auth/signup';

const Stack = createNativeStackNavigator();

// 🔑 이미지 URI 경로를 require와 resolveAssetSource를 통해 미리 준비합니다.
const BACKGROUND_IMAGE_URI = Image.resolveAssetSource(require('./assets/background.png')); 

// ------------------------------------
// 🔑 PreloadingScreen 정의 (AuthStack보다 앞에 위치해야 합니다!)
// ------------------------------------
function PreloadingScreen() {
    // styles 객체를 참조하기 위해 View와 ActivityIndicator를 import 합니다.
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={{ marginTop: 10, color: '#333' }}>화면 준비 중...</Text>
        </View>
    );
}

// ------------------------------------
// 인증 관련 화면 스택 (이미지 사전 로딩 로직 포함)
// ------------------------------------
const AuthStack = () => {
    const [isImageLoaded, setIsImageLoaded] = React.useState(false);

    // 🔑 AuthStack이 마운트될 때 이미지 사전 로딩 시작
    React.useEffect(() => {
        Image.prefetch(BACKGROUND_IMAGE_URI.uri)
            .then(() => setIsImageLoaded(true))
            .catch(error => {
                console.error("Image prefetch failed:", error);
                setIsImageLoaded(true); 
            });
    }, []);

    if (!isImageLoaded) {
        return <PreloadingScreen />;
    }

    return (
        <Stack.Navigator 
            screenOptions={{ 
                headerShown: false,
                // 화면 전환 시의 배경색을 'black'으로 설정하여 깜빡임을 방지합니다.
                contentStyle: { backgroundColor: 'black' } 
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
    );
};

// ------------------------------------
// 앱 주요 기능 화면 스택 
// ------------------------------------
const AppStack = () => (
    <Stack.Navigator>
        <Stack.Screen 
            name="MainTabs" 
            component={BottomTabNavigator} 
            options={{ headerShown: false }} 
        />
    </Stack.Navigator>
);

// ------------------------------------
// 네비게이션 루트
// ------------------------------------
function RootNavigator() {
    const { userToken, isLoading } = React.useContext(AuthContext);

    if (isLoading) {
      return <PreloadingScreen />; 
    }
  
    return (
      <NavigationContainer>
          {userToken == null ? <AuthStack /> : <AppStack />}
      </NavigationContainer>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <RootNavigator />
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f0f0f0'
    }
});
