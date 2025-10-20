// pages/Auth/login.js (로그인 폼과 로직)

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

// props로 navigation 객체를 받아와 화면 이동에 사용합니다.
export default function LoginScreen({ navigation }) {
  // 상태(State) 정의
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 로그인 버튼 클릭 시 실행 함수
  const handleLogin = () => {
    console.log('로그인 시도:', { email, password });
    
    // 현재는 임시로 Home으로 이동 (다음 단계에서 백엔드 통신 로직이 들어갑니다)
    navigation.navigate('Home'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App</Text>

      {/* 이메일 입력 필드 */}
      <TextInput
        style={styles.input}
        placeholder="이메일 주소"
        keyboardType="email-address" 
        autoCapitalize="none" 
        value={email} 
        onChangeText={setEmail} 
      />

      {/* 비밀번호 입력 필드 */}
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        secureTextEntry={true} 
        value={password}
        onChangeText={setPassword}
      />

      {/* 로그인 버튼 */}
      <Button 
        title="로그인" 
        onPress={handleLogin} 
        color="#007AFF" 
      />

      {/* 회원가입 화면으로 이동하는 버튼 */}
      <Button
        title="회원가입"
        onPress={() => navigation.navigate('Signup')} // 'Signup' 화면으로 이동
        color="gray"
      />
    </View>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
});