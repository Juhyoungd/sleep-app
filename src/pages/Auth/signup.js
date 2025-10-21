// src/pages/Auth/signup.js (회원가입 폼 및 로직)

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';

export default function SignupScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // 비밀번호 확인 상태
    const [isLoading, setIsLoading] = useState(false); 

    // 🔑 회원가입 API 주소 (백엔드 팀원과 협의 필요)
    const SIGNUP_URL = 'http://your-backend-ip-or-domain:port/api/register'; 

    const handleSignup = async () => {
        // 1. 입력 유효성 검사
        if (!email || !password || !confirmPassword) {
            Alert.alert('입력 오류', '모든 필드를 채워주세요.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('비밀번호 오류', '비밀번호가 일치하지 않습니다.');
            return;
        }
        
        setIsLoading(true);
        
        try {
            // 2. 백엔드에 회원가입 정보 전송 (POST 요청)
            const response = await fetch(SIGNUP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    // 비밀번호 확인 필드는 보통 서버로 전송하지 않습니다.
                }),
            });

            // 3. 응답 처리
            if (response.ok) {
                // 회원가입 성공
                const data = await response.json();
                
                Alert.alert('가입 성공', '회원가입이 완료되었습니다! 로그인해 주세요.');
                
                // 회원가입 성공 후 로그인 화면으로 이동
                navigation.navigate('Login'); 
                
            } else {
                // 회원가입 실패 (예: 이미 존재하는 이메일)
                const errorData = await response.json();
                Alert.alert('가입 실패', errorData.message || '회원가입에 실패했습니다.');
            }

        } catch (error) {
            // 네트워크 오류
            console.error('회원가입 네트워크 오류:', error);
            Alert.alert('오류', '네트워크 연결 상태를 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>
            
            {/* 이메일 입력 */}
            <TextInput
                style={styles.input}
                placeholder="이메일 주소"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            {/* 비밀번호 입력 */}
            <TextInput
                style={styles.input}
                placeholder="비밀번호"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
            />
            
            {/* 비밀번호 확인 입력 */}
            <TextInput
                style={styles.input}
                placeholder="비밀번호 확인"
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            {isLoading ? (
                <ActivityIndicator size="small" color="#007AFF" style={styles.loading} />
            ) : (
                <Button 
                    title="회원가입" 
                    onPress={handleSignup} 
                    color="#28a745" // 녹색 버튼
                />
            )}

            <View style={{ marginTop: 15 }}>
                <Button
                    title="로그인 화면으로 돌아가기"
                    onPress={() => navigation.navigate('Login')}
                    color="gray"
                />
            </View>
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