// src/pages/main.js (배경 이미지 및 녹음 기능)

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, ImageBackground, Image } from 'react-native'; 
import { request } from '../api/client'; // 🔑 API 클라이언트 import
import { AuthContext } from '../context/AuthContext';
import { Audio } from 'expo-av'; 

// 🔑 이미지 URI 경로를 require와 resolveAssetSource를 통해 미리 준비합니다.
const BACKGROUND_IMAGE_URI = Image.resolveAssetSource(require('../../assets/background.png')); 


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

// 🔑 실제 녹음 파일 전송(업로드) 함수
const uploadRecording = async (uri, token, sessionId) => {
    const formData = new FormData();
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `audio/${match[1]}` : `audio`;

    // @ts-ignore
    formData.append('audio', { uri, name: filename, type });

    // 🔑 중앙 API 클라이언트의 fetch를 직접 사용 (FormData 때문)
    // client.js의 BASE_URL을 가져오거나 여기에 직접 정의해야 합니다.
    const BASE_URL = 'http://192.168.0.1:8000/api'; // 👈 예시: client.js와 동일한 주소로 변경
    const UPLOAD_URL = `${BASE_URL}/sessions/${sessionId}/clips/upload`;

    try {
        const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // 'Content-Type': 'multipart/form-data' 헤더는 fetch가 자동으로 설정해줍니다.
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '파일 업로드에 실패했습니다.');
        }
        return await response.json(); // 성공 시 응답 데이터 반환
    } catch (error) {
        console.error('파일 업로드 실패:', error);
        throw error;
    }
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
            // 🔑 1. 실제 세션 생성 요청
            const sessionData = await request('/sessions', { method: 'POST' }, userToken);
            if (!sessionData || !sessionData.id) throw new Error('세션 ID를 받아오지 못했습니다.');
            
            const sessionId = sessionData.id;
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
            await uploadRecording(uri, userToken, sessionId);
            
            // 3. 세션 종료 요청 (모킹)
            // 실제 API 호출: POST /sessions/{id}/finalize. 백엔드가 분석 결과를 반환한다고 가정합니다.
            const analysisResult = await request(`/sessions/${sessionId}/finalize`, { method: 'POST' }, userToken);

            // 🔑 백엔드에서 받은 실제 분석 결과 데이터 사용
            // 백엔드 응답 형식이 아래와 다르다면 이 부분을 수정해야 합니다.
            const resultData = {
                ...analysisResult, // 백엔드에서 받은 데이터
                // chartData 형식이 라이브러리에 맞지 않다면 여기서 변환해줍니다.
                // 예: chartData: { labels: ..., datasets: [{ data: analysisResult.chartData }] }
            };

            // 🔑 ResultTab으로 이동하며 데이터 전달
            navigation.navigate('ResultTab', { 
                analysisId: sessionId,
                resultData: resultData,
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
