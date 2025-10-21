// src/pages/Auth/login.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext'; // 🔑 AuthContext 불러오기

export default function LoginScreen({ navigation }) {
    const { signIn } = React.useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); 

    const handleLogin = async () => {
        if (!email || !password) {
            alert('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        setIsLoading(true); 
        
        // 🔑 실제 API 주소를 사용하지 않고, 모킹 로직을 사용합니다.
        // const LOGIN_URL = 'http://192.168.0.5:8080/api/login'; 

        try {
            // ----------------------------------------------------
            // 🔑 모킹(Mocking) 시작: 실제 fetch 대신 가짜 응답을 만듭니다.
            // ----------------------------------------------------
            
            // 1. 서버 통신 시간을 흉내내기 위해 1.5초 지연시킵니다.
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 2. 입력된 이메일/비밀번호에 따라 성공/실패를 가정합니다.
            const MOCK_SUCCESS_EMAIL = 'test@test.com';

            if (email === MOCK_SUCCESS_EMAIL && password === '1234') {
                // 로그인 성공 가정
                const MOCK_TOKEN = 'mock_jwt_token_for_user_' + Date.now();
                
                // 3. AuthContext의 signIn 함수를 호출하여 가짜 토큰을 저장하고 상태 업데이트
                await signIn(MOCK_TOKEN); 
                console.log('로그인 모킹 성공. 가짜 토큰:', MOCK_TOKEN); 

            } else {
                // 로그인 실패 가정
                alert('로그인 모킹 실패: ID/PW를 확인해주세요 (모킹 테스트 중).');
            }
            
            // ----------------------------------------------------
            // 🔑 모킹(Mocking) 종료
            // ----------------------------------------------------
            
        } catch (error) {
            // 모킹 중에는 네트워크 오류가 나지 않지만, 구조 유지를 위해 남겨둡니다.
            console.error('모킹 중 오류:', error);
            alert('테스트 모킹 중 예외 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일 주소"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      {isLoading ? (
        <ActivityIndicator size="small" color="#007AFF" style={styles.loading} />
      ) : (
        <Button 
          title="로그인" 
          onPress={handleLogin} 
          color="#007AFF" 
        />
      )}

      <Button
        title="회원가입"
        onPress={() => navigation.navigate('Signup')}
        color="gray"
      />
    </View>
  );
}

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
  loading: {
      marginVertical: 10,
  }
});