// src/pages/main.js (배경 이미지 및 녹음 기능)

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, ImageBackground, Image } from 'react-native'; 
import { AuthContext } from '../context/AuthContext';
import { Audio } from 'expo-av'; 

// 🔑 이미지 URI 경로를 require와 resolveAssetSource를 통해 미리 준비합니다.
const BACKGROUND_IMAGE_URI = Image.resolveAssetSource(require('../../assets/background.png')); 

// 🔑 BASE URL 설정 (실제 IP와 포트로 교체하세요!)
const BASE_URL = 'http://#YOUR_BASE_URL'; 


// 🔑 녹음 설정 (이전과 동일)
const recordingOptions = {
    isMeteringEnabled: true,
    android: {
        extension: '.m4a',
        outputFormat: Audio.RECORDING_OPTIONS_ANDROID_OUTPUT_FORMAT_MPEG_4,
        audioEncoder: Audio.RECORDING_OPTIONS_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
    },
    ios: {
        extension: '.m4a',
        audioQuality: Audio.RECORDING_OPTIONS_IOS_AUDIO_QUALITY_HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
    },
};

// 🔑 녹음 파일 전송(업로드) 함수: 네트워크 오류 없이 항상 성공하는 모킹 버전
const uploadRecording = async (uri, token, sessionId) => {
    console.log(`[네트워크 오류 방지 모킹] 파일 URI: ${uri}, 세션 ID: ${sessionId}`);
    
    // 🔑 실제 서버 통신 시간을 흉내내기 위해 1초 지연시킵니다.
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    // 🔑 항상 성공했다고 가정하고 가짜 분석 결과를 반환합니다.
    return { success: true, analysisId: 'MOCK_AI_RESULT_789' };
    
    // --- 실제 API 호출 로직 ---
    /*
    const UPLOAD_URL = `${BASE_URL}/sessions/${sessionId}/clips/upload`; 
    // ... (fetch 호출 및 FormData 구성 로직)
    */
};


export default function MainScreen({ navigation }) {
    const { signOut, userToken } = React.useContext(AuthContext); 

    const [recording, setRecording] = useState(null); 
    const [isRecording, setIsRecording] = useState(false); 
    const [recordingPermission, setRecordingPermission] = useState(null); 
    const [isUploading, setIsUploading] = useState(false); // 업로드 상태
    const [currentSessionId, setCurrentSessionId] = useState(null); // 🔑 세션 ID 상태 추가
    
    // 🔑 녹음 시간 알림 기능 추가
    const [notificationDuration, setNotificationDuration] = useState(null); // 알림 시간 (시간 단위)
    const timerRef = useRef(null); // 타이머 ID를 저장하기 위한 ref
    const isRecordingRef = useRef(isRecording); // setTimeout 클로저 문제 해결을 위한 ref


    // ------------------------------------
    // 1. 마이크 권한 요청 로직
    // ------------------------------------
    useEffect(() => {
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            setRecordingPermission(status === 'granted'); 
            if (status !== 'granted') {
                Alert.alert('마이크 권한 필요', '수면 분석을 위해 녹음 권한이 필요합니다.');
            }
        })();
    }, []);

    // 🔑 isRecording 상태가 변경될 때마다 ref를 업데이트
    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);


    // ------------------------------------
    // 2. 통합된 메인 버튼 핸들러 (녹음 시작/중지 & 분석 요청 토글)
    // ------------------------------------
    const handleMainButtonPress = async () => {
        if (isRecording) {
            await stopAndAnalyzeRecording(); 
        } else {
            await startRecording(); 
        }
    };

    // ------------------------------------
    // 3. 녹음 시작 로직 (세션 생성 추가)
    // ------------------------------------
    const startRecording = async () => {
        if (!recordingPermission) {
            Alert.alert('권한 없음', '마이크 녹음 권한을 허용해야 합니다.');
            return;
        }

        try {
            // 🔑 1. 세션 생성 요청 (모킹)
            // 실제 API 호출: POST /sessions
            const sessionId = 'MOCK_SESSION_' + Date.now(); // 가짜 세션 ID 생성
            setCurrentSessionId(sessionId); // 세션 ID 저장

            // 🔑 2. 녹음 시작
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const newRecording = new Audio.Recording(); 
            setRecording(newRecording); 
            setIsRecording(true); 
            
            await newRecording.prepareToRecordAsync(recordingOptions);
            await newRecording.startAsync(); 
            
            Alert.alert('녹음 시작', `세션 ID ${sessionId}로 녹음이 시작되었습니다.`);

            // 🔑 알림 타이머 설정
            if (notificationDuration > 0) {
                const durationInMs = notificationDuration * 60 * 60 * 1000;
                console.log(`알림이 ${notificationDuration}시간 후에 설정되었습니다.`);
                timerRef.current = setTimeout(() => {
                    if (isRecordingRef.current) { // ref를 통해 최신 녹음 상태 확인
                        Alert.alert('녹음 시간 알림', `${notificationDuration}시간 녹음이 완료되었습니다. 분석을 위해 녹음을 중지할 수 있습니다.`);
                    }
                }, durationInMs);
            }

        } catch (err) {
            console.error('녹음/세션 시작 실패', err);
            Alert.alert('오류', '세션 생성 및 녹음을 시작할 수 없습니다.');
            setIsRecording(false);
            setCurrentSessionId(null);
        }
    };


    // ------------------------------------
    // 4. 녹음 중지 및 분석 요청 로직 (클립 업로드 후 세션 종료)
    // ------------------------------------
    const stopAndAnalyzeRecording = async () => {
        if (!recording || !currentSessionId) return;

        setIsRecording(false); 
        const sessionId = currentSessionId;
        setCurrentSessionId(null);

        // 🔑 설정된 타이머가 있다면 제거
        if (timerRef.current) clearTimeout(timerRef.current);
        
        try {
            // 1. 녹음 중지 및 URI 획득
            await recording.stopAndUnloadAsync(); 
            const uri = recording.getURI(); 
            setRecording(null); 
            
            Alert.alert('녹음 완료', '녹음 클립을 서버로 전송합니다.');

            setIsUploading(true); // 업로드 상태 시작

            // 2. 녹음 클립 업로드 (모킹)
            const uploadResult = await uploadRecording(uri, userToken, sessionId);
            
            if (!uploadResult.success) throw new Error(uploadResult.message);
            
            // 3. 세션 종료 요청 (모킹)
            // 실제 API 호출: POST /sessions/{id}/finalize
            await new Promise(resolve => setTimeout(resolve, 500)); // 세션 종료 시간 모킹

            // 🔑 분석 결과 화면으로 전달할 가짜 데이터
            const mockAnalysisData = {
                sleepDuration: "7.5 시간",
                snoreCount: 45,
                pattern: "깊은 수면 부족",
                // 🔑 react-native-chart-kit 형식에 맞게 datasets 배열로 데이터를 감싸줍니다.
                chartData: {
                    labels: ["월", "화", "수", "목", "금", "토", "일"],
                    datasets: [
                        {
                            data: [6.5, 7.2, 8.0, 7.5, 6.8, 9.0, 7.0] 
                        }
                    ]
                },
                clips: [
                    { id: 1, time: "01:30 AM", duration: 3, file_path: 'mock_audio_1.mp3' },
                    { id: 2, time: "03:45 AM", duration: 5, file_path: 'mock_audio_2.mp3' },
                    { id: 3, time: "05:10 AM", duration: 2, file_path: 'mock_audio_3.mp3' },
                ]
            };

            // 🔑 ResultTab으로 이동하며 데이터 전달
            navigation.navigate('ResultTab', { 
                analysisId: sessionId, 
                resultData: mockAnalysisData,
                transferTime: new Date().toLocaleTimeString(),
            });
            
            
        } catch (error) {
            console.error('녹음 중지/분석 실패', error);
            Alert.alert('오류', `처리 실패: ${error.message}`);
        } finally {
            setIsUploading(false); // 업로드 상태 종료
        }
    };


    // ------------------------------------
    // 5. UI 렌더링
    // ------------------------------------
    const buttonText = isUploading 
        ? 'AI 분석 중...' 
        : isRecording 
        ? '녹음 중지 및 분석 요청' 
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
                    {isRecording ? '🔴 지금 녹음이 진행되고 있습니다.' : isUploading ? '🌐 녹음 파일을 서버로 전송 중...' : '버튼을 눌러 수면 녹음을 시작하세요.'}
                </Text>
                
                {/* 원 모양의 큰 버튼 */}
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

                {/* 🔑 녹음 시간 알림 설정 UI */}
                {!isRecording && !isUploading && (
                    <View style={styles.durationSelector}>
                        <Text style={styles.durationLabel}>알림 설정 (시간)</Text>
                        <View style={styles.durationButtons}>
                            {[6, 7, 8].map(hour => (
                                <TouchableOpacity
                                    key={hour}
                                    style={[styles.durationButton, notificationDuration === hour && styles.durationButtonSelected]}
                                    onPress={() => setNotificationDuration(prev => prev === hour ? null : hour)}
                                >
                                    <Text style={[styles.durationButtonText, notificationDuration === hour && styles.durationButtonTextSelected]}>{String(hour)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <View style={{ marginTop: 40 }}>
                    <Button
                        title="로그아웃"
                        onPress={() => void signOut()}
                        color="#dc3545"
                    />
                </View>
            </View>
        </ImageBackground>
    );
}

// ------------------------------------
// 6. 스타일
// ------------------------------------
const styles = StyleSheet.create({
    background: {
        flex: 1, 
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    },
    // 🔑 버튼 위치 조정을 위한 justifyContent: 'space-around' 적용
    contentContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-around', // 🔑 요소 간 공간을 균등하게 분배 (달을 피함)
        alignItems: 'center',
        backgroundColor: 'transparent', 
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#fff', 
        marginTop: 40, // 상단 여백 추가하여 달과 분리
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 30, // 버튼과 분리
        color: '#ddd', 
        textAlign: 'center'
    },
    mainButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#6A5ACD', // 차분한 보라색
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40, // 하단으로 내리기 위해 마진 축소
        elevation: 5, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    mainButtonRecording: {
        backgroundColor: '#dc3545', 
    },
    mainButtonUploading: {
        backgroundColor: '#4A90E2', 
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // 🔑 알림 시간 설정 스타일
    durationSelector: {
        alignItems: 'center',
        marginTop: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
    },
    durationLabel: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 10,
    },
    durationButtons: {
        flexDirection: 'row',
    },
    durationButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        marginHorizontal: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#fff',
    },
    durationButtonSelected: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    durationButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    durationButtonTextSelected: {
        color: '#6A5ACD', // 메인 버튼 색상과 동일하게
    }
});
