// src/pages/main.js (배경 이미지 및 녹음 기능)

import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, ImageBackground, Image } from 'react-native'; // 🔑 ImageBackground, Image 추가
import { AuthContext } from '../context/AuthContext';
import { Audio } from 'expo-av'; 

// 🔑 이미지 URI 경로를 require와 resolveAssetSource를 통해 미리 준비합니다.
// 경로가 Auth 폴더의 login/signup과 다름을 주의하세요: '../pages/'에서 '../../assets'가 아닌, '../'에서 '../../assets'
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

// 🔑 녹음 파일 전송(업로드) 함수: 네트워크 오류 없이 항상 성공하는 모킹 버전
const uploadRecording = async (uri, token) => {
    console.log(`[네트워크 오류 방지 모킹] 파일 URI: ${uri}, 토큰: ${token}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    return { success: true, analysisId: 'MOCK_AI_RESULT_789' };
};


export default function MainScreen({ navigation }) {
    const { signOut, userToken } = React.useContext(AuthContext); 

    const [recording, setRecording] = useState(null); 
    const [isRecording, setIsRecording] = useState(false); 
    const [recordingPermission, setRecordingPermission] = useState(null); 
    const [isUploading, setIsUploading] = useState(false); 

    // ------------------------------------
    // 1. 마이크 권한 요청 로직 (이전에 구현했던 내용)
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
    // 3. 녹음 시작 로직
    // ------------------------------------
    const startRecording = async () => {
        if (!recordingPermission) {
            Alert.alert('권한 없음', '마이크 녹음 권한을 허용해야 합니다.');
            return;
        }

        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const newRecording = new Audio.Recording(); 
            setRecording(newRecording); 
            setIsRecording(true); 
            
            await newRecording.prepareToRecordAsync(recordingOptions);
            await newRecording.startAsync(); 
            
            Alert.alert('녹음 시작', '녹음이 시작되었습니다. 수면이 끝나면 버튼을 다시 눌러주세요.');

        } catch (err) {
            console.error('녹음 시작 실패', err);
            Alert.alert('오류', '녹음을 시작할 수 없습니다.');
            setIsRecording(false);
        }
    };


    // ------------------------------------
    // 4. 녹음 중지 및 분석 요청 로직
    // ------------------------------------
    const stopAndAnalyzeRecording = async () => {
        if (!recording) return;

        setIsRecording(false); 
        
        try {
            await recording.stopAndUnloadAsync(); 
            const uri = recording.getURI(); 
            setRecording(null); 
            
            Alert.alert('녹음 완료', '녹음이 종료되었습니다. AI 분석을 시작합니다.');

            setIsUploading(true); 

            const analysisResult = await uploadRecording(uri, userToken);
            
            if (analysisResult.success) {
                const mockAnalysisData = {
                    sleepDuration: "7.5 시간",
                    snoreCount: 45,
                    pattern: "깊은 수면 부족",
                };

                // 🔑 ResultTab으로 이동하며 데이터 전달
                navigation.navigate('ResultTab', { 
                    analysisId: analysisResult.analysisId,
                    resultData: mockAnalysisData,
                    transferTime: new Date().toLocaleTimeString(),
                });
                
            } else {
                 Alert.alert('분석 요청 실패', '모킹 실패: 전송 로직 자체에 문제가 있습니다.');
            }

        } catch (error) {
            console.error('녹음 중지/분석 실패', error);
            Alert.alert('오류', '녹음 중지 및 분석 요청에 실패했습니다.');
        } finally {
            setIsUploading(false);
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
        // 🔑 1. ImageBackground 컴포넌트 사용 시작
        <ImageBackground 
            source={BACKGROUND_IMAGE_URI} 
            style={styles.background} 
            resizeMode="cover" 
        >
            {/* 🔑 2. 투명도 50%를 위한 오버레이 레이어 */}
            <View style={styles.overlay} />

            {/* 🔑 3. 실제 UI 컴포넌트 컨테이너 */}
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
                    onPress={handleMainButtonPress}
                    disabled={isUploading} 
                >
                    {isUploading ? (
                        <ActivityIndicator size="large" color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    )}
                </TouchableOpacity>

                <View style={{ marginTop: 40 }}>
                    <Button
                        title="로그아웃"
                        onPress={signOut}
                        color="#dc3545"
                    />
                </View>
            </View>
        </ImageBackground>
    );
}

// ------------------------------------
// 6. 스타일 (배경 및 UI 스타일)
// ------------------------------------
const styles = StyleSheet.create({
    // 🔑 배경 관련 스타일
    background: {
        flex: 1, 
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // 50% 투명도 오버레이
    },
    contentContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent', // 배경 투명하게
    },

    // UI 스타일 (글자색은 배경에 맞게 흰색 계열로 조정)
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#fff', 
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 50,
        color: '#ddd', 
        textAlign: 'center'
    },
    mainButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#6A5ACD', // 🔑 녹색 -> 차분한 보라색 계열로 변경
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 80,
        elevation: 5, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    mainButtonRecording: {
        backgroundColor: '#dc3545', // 녹음 중 색상 (빨간색) 유지
    },
    mainButtonUploading: {
        backgroundColor: '#4A90E2', // 분석 중 색상 (파란색) 유지
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});
