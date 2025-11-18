// src/pages/main.js (🔥 완전 Mock 버전)

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native'; 
import { AuthContext } from '../context/AuthContext';
import { Audio } from 'expo-av';
import { Image } from 'react-native';

// 🔥 Mock용 배경 이미지
const BACKGROUND_IMAGE_URI = Image.resolveAssetSource(require('../../assets/background.png'));

// 🔥 Mock: 세션 ID 생성기
const mockCreateSession = async () => {
    await new Promise(res => setTimeout(res, 500)); // 0.5초 지연(진짜처럼 보이게)
    return { id: Math.floor(Math.random() * 1000000).toString() };
};

// 🔥 Mock: 파일 업로드
const mockUploadRecording = async () => {
    await new Promise(res => setTimeout(res, 1000)); // 1초 지연
    return { success: true };
};

// 🔥 Mock: 분석 결과 데이터 생성
const mockFinalizeSession = async (sessionId) => {
    await new Promise(res => setTimeout(res, 1000));

    return {
        sessionId,
        summary: "수면 상태가 안정적이며 큰 이상 신호는 감지되지 않았습니다.",
        snoreLevel: Math.floor(Math.random() * 100),
        movement: Math.floor(Math.random() * 100),
        chartData: {
            labels: ["1h", "2h", "3h", "4h", "5h", "6h"],
            datasets: [{ data: Array.from({ length: 6 }, () => Math.random() * 100) }]
        }
    };
};

export default function MainScreen({ navigation }) {
    const { signOut, userToken } = React.useContext(AuthContext);

    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingPermission, setRecordingPermission] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    const [notificationDuration, setNotificationDuration] = useState(null);
    const timerRef = useRef(null);
    const isRecordingRef = useRef(isRecording);

    useEffect(() => {
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            setRecordingPermission(status === 'granted');
            if (status !== 'granted') {
                Alert.alert('마이크 권한 필요', '수면 분석을 위해 녹음 권한이 필요합니다.');
            }
        })();
    }, []);

    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    const handleMainButtonPress = async () => {
        if (isRecording) {
            await stopAndAnalyzeRecording();
        } else {
            await startRecording();
        }
    };

    // 🔥 녹음 시작 (Mock 세션 생성 포함)
    const startRecording = async () => {
        if (!recordingPermission) {
            Alert.alert('권한 없음', '마이크 권한을 허용해야 합니다.');
            return;
        }

        try {
            // 1) Mock 세션 생성
            const sessionData = await mockCreateSession();
            const sessionId = sessionData.id;
            setCurrentSessionId(sessionId);

            // 2) 실제 녹음 시작
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const newRecording = new Audio.Recording();
            setRecording(newRecording);
            setIsRecording(true);

            await newRecording.prepareToRecordAsync({
                android: {
                    extension: '.m4a',
                    outputFormat: Audio.RECORDING_OPTIONS_ANDROID_OUTPUT_FORMAT_MPEG_4,
                    audioEncoder: Audio.RECORDING_OPTIONS_ANDROID_AUDIO_ENCODER_AAC,
                },
                ios: {
                    extension: '.m4a',
                    audioQuality: Audio.RECORDING_OPTIONS_IOS_AUDIO_QUALITY_HIGH,
                }
            });
            await newRecording.startAsync();

            Alert.alert('녹음 시작', `세션 ID ${sessionId}로 녹음이 시작되었습니다.`);

        } catch (err) {
            console.error('녹음 시작 실패', err);
            Alert.alert('오류', '녹음을 시작할 수 없습니다.');
        }
    };

    // 🔥 녹음 중지 + Mock 업로드 + Mock 분석 실행
    const stopAndAnalyzeRecording = async () => {
        if (!recording || !currentSessionId) return;

        setIsRecording(false);
        const sessionId = currentSessionId;
        setCurrentSessionId(null);

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            setIsUploading(true);
            Alert.alert("녹음 완료", "AI 분석을 시작합니다...");

            // 1) Mock 업로드
            await mockUploadRecording(uri);

            // 2) Mock 분석
            const resultData = await mockFinalizeSession(sessionId);

            // 3) 결과 페이지 이동
            navigation.navigate("ResultTab", {
                analysisId: sessionId,
                resultData,
                transferTime: new Date().toLocaleTimeString(),
            });

        } catch (error) {
            console.error(error);
            Alert.alert("오류", error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const buttonText = isUploading
        ? 'AI 분석 중...'
        : isRecording
        ? '녹음 중지 및 분석하기'
        : '녹음 시작';

    return (
        <ImageBackground 
            source={BACKGROUND_IMAGE_URI} 
            style={styles.background} 
            resizeMode="cover"
        >
            <View style={styles.overlay} />

            <View style={styles.contentContainer}>
                <Text style={styles.title}>수면 분석 시작</Text>

                <Text style={styles.subtitle}>
                    {isRecording ? '🔴 녹음이 진행 중입니다.' :
                     isUploading ? '🌐 분석 중입니다...' :
                     '버튼을 눌러 수면 녹음을 시작하세요.'}
                </Text>

                <TouchableOpacity
                    style={[
                        styles.mainButton,
                        isRecording && styles.mainButtonRecording,
                        isUploading && styles.mainButtonUploading,
                    ]}
                    onPress={() => void handleMainButtonPress()}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <ActivityIndicator size="large" color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    )}
                </TouchableOpacity>

                <Button
                    title="로그아웃"
                    onPress={() => void signOut()}
                    color="#dc3545"
                />
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: { flex: 1 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    contentContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#fff',
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 30,
        color: '#ddd',
        textAlign: 'center',
    },
    mainButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#6A5ACD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    mainButtonRecording: { backgroundColor: '#dc3545' },
    mainButtonUploading: { backgroundColor: '#4A90E2' },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
