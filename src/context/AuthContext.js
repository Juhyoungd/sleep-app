// src/context/AuthContext.js

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 인증 관련 상태를 제공할 Context 생성
export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = React.useState(null); // 토큰 상태
  const [isLoading, setIsLoading] = React.useState(true); // 로딩 상태

  // 앱 시작 시 토큰을 확인하는 비동기 함수
  const bootstrapAsync = async () => {
    let token = null;
    try {
      token = await AsyncStorage.getItem('userToken');
    } catch (e) {
      console.error("Failed to load token:", e);
    }
    setUserToken(token);
    setIsLoading(false);
  };

  React.useEffect(() => {
    bootstrapAsync();
  }, []);

  // Context를 통해 자식 컴포넌트에 제공할 값
  const authContextValue = React.useMemo(() => ({
    // 로그인 시 토큰을 저장하고 상태를 업데이트
    signIn: async (token) => {
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);
    },
    // 로그아웃 시 토큰을 삭제하고 상태를 업데이트
    signOut: async () => {
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
    },
    userToken, // 현재 토큰 값
    isLoading, // 로딩 상태
  }), [userToken, isLoading]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};