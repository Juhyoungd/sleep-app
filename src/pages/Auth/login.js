// src/pages/Auth/login.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ImageBackground, Alert } from 'react-native';
import { request } from './client';
import { AuthContext } from '../../context/AuthContext';

const BACKGROUND_IMAGE = require('../../../assets/background.png');

export default function LoginScreen({ navigation }) {
    const { signIn } = React.useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {

        if (!email || !password) {
            Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        // 🔥 임시 로그인
        if (email === 'test@test.com' && password === '1234') {
            Alert.alert('로그인 성공', '임시 계정으로 로그인되었습니다!');
            await signIn("test-token");     // ← reset() 절대 사용 ❌
            return;
        }

        // 🔥 실제 API 로그인
        setIsLoading(true);

        try {
            const data = await request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            if (data && data.token) {
                await signIn(data.token);
            } else {
                throw new Error('로그인 실패: 토큰 없음');
            }

        } catch (error) {
            console.log('로그인 오류:', error.message);
        } finally {
            setIsLoading(false);
        }
    };

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
                    color="#ffffff"
                />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    contentContainer: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
        backgroundColor: 'transparent',
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
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: '#fff',
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#555',
    },
    loading: { marginVertical: 10 },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginVertical: 15,
    },
});
