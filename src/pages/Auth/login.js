// src/pages/Auth/login.js (최종 완성본)

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ImageBackground, Alert } from 'react-native';
import { request } from './client'; // 🔑 API 클라이언트 import 경로 수정
import { AuthContext } from '../../context/AuthContext'; 

// 🔑 이미지 경로 수정: 'src/pages/Auth/'에서 '../../assets/background.png'로 경로 수정
const BACKGROUND_IMAGE = require('../../../assets/background.png'); 


export default function LoginScreen({ navigation }) {
    // 1. AuthContext에서 signIn 함수를 가져옵니다.
    const { signIn } = React.useContext(AuthContext); 
    
    // 2. 상태 정의
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); 

    // 🔑 3. handleLogin 함수는 컴포넌트 함수 내부에 정의되어야 합니다!
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        setIsLoading(true); 
        
        try {
            // 🔑 실제 백엔드 API 호출로 변경
            const data = await request('/auth/login', { // 🔑 API 명세에 따라 '/auth/login'으로 수정
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            // 🔑 서버 응답에 토큰이 포함되어 있다고 가정 (예: { token: '...' })
            if (data && data.token) {
                await signIn(data.token);
            } else {
                throw new Error('로그인에 실패했습니다. (토큰 없음)');
            }
        } catch (error) {
            // request 함수에서 이미 Alert를 호출하므로 여기서는 추가 Alert가 필요 없을 수 있습니다.
            // 필요하다면 error.message를 사용하여 더 구체적인 오류를 표시할 수 있습니다.
        } finally {
            setIsLoading(false);
        }
    };
    // 🔑 handleLogin 함수 정의 끝

    return (
        <ImageBackground 
            source={BACKGROUND_IMAGE} 
            style={styles.background} 
            resizeMode="cover" 
        >
            <View style={styles.overlay} />

            <View style={styles.contentContainer}> 
                
                <Text style={styles.title}>Sleep Analyzer</Text>
                <Text style={styles.subtitle}></Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="이메일 주소"
                    placeholderTextColor="#ccc" 
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="비밀번호"
                    placeholderTextColor="#ccc" 
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                />

                {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" style={styles.loading} />
                ) : (
                    // 🔑 async 함수의 반환값을 무시하도록 수정합니다.
                    <Button 
                        title="로그인" 
                        onPress={() => void handleLogin()} 
                        color="#4A90E2" 
                    />
                )}

                <View style={styles.separator} />

                <Button
                    title="회원가입"
                    onPress={() => navigation.navigate('Signup')}
                    color="#ffffffff" 
                />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1, 
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    contentContainer: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
        backgroundColor: 'transparent', 
        zIndex: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
        color: '#fff', 
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 40,
        textAlign: 'center',
        color: '#ddd',
    },
    input: {
        height: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: '#fff',
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#555',
    },
    loading: {
        marginVertical: 10,
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginVertical: 15,
    }
});
