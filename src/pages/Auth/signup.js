// src/pages/Auth/signup.js (배경 이미지 및 50% 투명도 적용)

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ImageBackground, Alert } from 'react-native';

// 🔑 이미지 경로 수정: 'src/pages/Auth/'에서 '../../assets/background.png'로 경로 수정
// assets 폴더가 프로젝트 루트에 있다고 가정할 때
const BACKGROUND_IMAGE = require('../../../assets/background.png'); 


export default function SignupScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // 비밀번호 확인 상태
    const [isLoading, setIsLoading] = useState(false); 

    // 🔑 회원가입 API 주소 (실제 백엔드 연동 시 변경 필요)
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
            // ----------------------------------------------------
            // 🔑 모킹(Mocking) 로직을 사용하거나, 실제 fetch 로직을 사용합니다.
            // 현재는 로그인과 동일하게 모킹 대신 실제 fetch 구조를 유지합니다.
            // ----------------------------------------------------
            
            const response = await fetch(SIGNUP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, password: password }),
            });

            if (response.ok) {
                Alert.alert('가입 성공', '회원가입이 완료되었습니다! 이제 로그인해 주세요.');
                // 가입 성공 후 로그인 화면으로 이동
                navigation.navigate('Login'); 
                
            } else {
                const errorData = await response.json();
                Alert.alert('가입 실패', errorData.message || '회원가입에 실패했습니다. 서버 상태를 확인하세요.');
            }

        } catch (error) {
            console.error('회원가입 네트워크 오류:', error);
            // 🔑 백엔드 연동 전이라면 이 오류가 발생합니다.
            Alert.alert('오류', '네트워크 연결 상태를 확인해주세요. (서버 미접속)');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // 🔑 ImageBackground 및 Overlay 적용
        <ImageBackground 
            source={BACKGROUND_IMAGE} 
            style={styles.background} 
            resizeMode="cover" 
        >
            <View style={styles.overlay} />

            <View style={styles.contentContainer}> 
                
                <Text style={styles.title}>회원가입</Text>
                <Text style={styles.subtitle}></Text>
                
                {/* 이메일 입력 */}
                <TextInput
                    style={styles.input}
                    placeholder="이메일 주소"
                    placeholderTextColor="#ccc" 
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                {/* 비밀번호 입력 */}
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호"
                    placeholderTextColor="#ccc" 
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                />
                
                {/* 비밀번호 확인 입력 */}
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호 확인"
                    placeholderTextColor="#ccc" 
                    secureTextEntry={true}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" style={styles.loading} />
                ) : (
                    <Button 
                        title="회원가입 완료" 
                        onPress={handleSignup} 
                        color="#4A90E2" 
                    />
                )}

                <View style={styles.separator} />

                <Button
                    title="로그인 화면으로 돌아가기"
                    onPress={() => navigation.navigate('Login')}
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
    // 🔑 투명도 50% 검은색 오버레이 레이어
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
