// src/pages/Auth/login.js (최종 완성본)

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ImageBackground, Alert } from 'react-native';
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
            // 🔑 모킹(Mocking) 로직: 네트워크 오류 방지
            await new Promise(resolve => setTimeout(resolve, 1500));
            const MOCK_SUCCESS_EMAIL = 'test@test.com';

            if (email === MOCK_SUCCESS_EMAIL && password === '1234') {
                const MOCK_TOKEN = 'mock_jwt_token_' + Date.now();
                await signIn(MOCK_TOKEN); 
            } else {
                Alert.alert('로그인 모킹 실패', 'ID/PW를 확인해주세요.');
            }
            
        } catch (error) {
            console.error('모킹 중 오류:', error);
            Alert.alert('테스트 오류', '로그인 처리 중 예외가 발생했습니다.');
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
                    // 🔑 여기서 handleLogin 함수가 사용됩니다.
                    <Button 
                        title="로그인" 
                        onPress={handleLogin} 
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
