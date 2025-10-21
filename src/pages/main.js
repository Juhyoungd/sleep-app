// src/pages/main.js (녹음, 업로드, UI 통합 버전)

import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Audio } from 'expo-av'; 

// 🔑 녹음 설정 (수면 분석을 위한 일반적인 설정)
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

// 🔑 녹음 파일 전송(업로드) 함수: 파일을 FormData로 만들어 백엔드에 전송합니다.
const uploadRecording = async (uri, token) => {
    // 🔑 실제 컴퓨터 IP와 백엔드 포트로 변경해야 합니다.
    const UPLOAD_URL = 'http://your-backend-ip-or-domain:port/api/upload-audio'; 
    
    const data = new FormData();
    
    // 1. 녹음 파일 정보를 FormData에 추가 (백엔드와 필드 이름 'audio' 협의 필요)
    data.append('audio', {
        uri: uri, 
        type: 'audio/m4a', 
        name: 'sleep_recording_' + Date.now() + '.m4a', 
    });

    try {
        const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            headers: {
                // 2. 인증 토큰을 헤더에 첨부
                'Authorization': `Bearer ${token}`, 
            },
            body: data, // FormData 객체 전송
        });

        if (response.ok) {
            const result = await response.json();
            // 백엔드가 분석 결과를 반환한다고 가정
            return { success: true, analysisId: result.analysis_id };
        } else {
            const errorText = await response.text();
            console.error('업로드 실패 응답:', errorText);
            return { success: false, message: '파일 전송 실패' };
        }

    } catch (error) {
        console.error('네트워크 오류로 파일 전송 실패:', error);
        return { success: false, message: '네트워크 연결 오류' };
    }
};


export default function MainScreen({ navigation }) {
    const { signOut, userToken } = React.useContext(AuthContext); 

    const [recording, setRecording] = useState(null); 
    const [isRecording, setIsRecording] = useState(false); 
    const [recordingPermission, setRecordingPermission] = useState(null); 
    const [isUploading, setIsUploading] = useState(false); // 업로드 상태

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


    // ------------------------------------
    // 2. 통합된 메인 버튼 핸들러 (녹음 시작/중지 & 분석 요청 토글)
    // ------------------------------------
    const handleMainButtonPress = async () => {
        if (isRecording) {
            await stopAndAnalyzeRecording(); // 녹음 중이면 -> 중지 및 분석 요청
        } else {
            await startRecording(); // 녹음 중이 아니면 -> 녹음 시작
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

            setIsUploading(true); // 업로드 상태 시작

            // 백엔드 파일 업로드 및 분석 요청 (토큰 사용)
            const analysisResult = await uploadRecording(uri, userToken);

            if (analysisResult.success) {
                Alert.alert('분석 요청 성공', `AI 분석이 요청되었습니다. 결과 ID: ${analysisResult.analysisId}`);
                // TODO: 분석 결과 화면으로 이동하거나, 분석 상태를 추적하는 로직 추가
            } else {
                 Alert.alert('분석 요청 실패', analysisResult.message || '파일 전송에 실패했습니다. (네트워크/서버)');
            }

        } catch (error) {
            console.error('녹음 중지/분석 실패', error);
            Alert.alert('오류', '녹음 중지 및 분석 요청에 실패했습니다.');
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
        <View style={styles.container}>
            <Text style={styles.title}>수면 분석 시작</Text>
            <Text style={styles.subtitle}>
                {isRecording ? '🔴 지금 녹음이 진행되고 있습니다.' : isUploading ? '🌐 녹음 파일을 서버로 전송 중...' : '버튼을 눌러 수면 녹음을 시작하세요.'}
            </Text>
            
            {/* 원 모양의 큰 버튼 */}
            <TouchableOpacity
                style={[
                    styles.mainButton, 
                    isRecording && styles.mainButtonRecording, // 녹음 중일 때 색상 변경
                    isUploading && styles.mainButtonUploading, // 업로드 중일 때 색상 변경
                ]}
                onPress={handleMainButtonPress}
                disabled={isUploading} // 업로드 중에는 중복 클릭 방지
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
    );
}

// ------------------------------------
// 스타일
// ------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 50,
        color: '#6c757d',
        textAlign: 'center'
    },
    mainButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#28a745', 
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
        backgroundColor: '#dc3545', 
    },
    mainButtonUploading: {
        backgroundColor: '#007AFF', 
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});