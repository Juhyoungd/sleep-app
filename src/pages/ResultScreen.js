// src/pages/ResultScreen.js (분석 결과 화면 - 차트 및 오디오 재생 통합)

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    Alert,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { request } from './Auth/client'; // 🔑 API 클라이언트 import 경로 수정 (필요 시)
import { AuthContext } from '../context/AuthContext'; // 🔑 토큰 사용을 위해 import

const screenWidth = Dimensions.get('window').width;

export default function ResultScreen() {
    const route = useRoute();
    const { analysisId, resultData, transferTime } = route.params || {};

    // 🔑 백엔드 오디오 파일에 접근하기 위한 기본 URL
    const AUDIO_BASE_URL = 'http://192.168.0.1:8000/storage'; // 👈 예시: 실제 오디오 파일이 저장된 경로로 변경
    const { userToken } = React.useContext(AuthContext);

    // ------------------------------------
    // 1. 오디오 재생 상태 관리
    // ------------------------------------
    const [soundObject, setSoundObject] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentClipId, setCurrentClipId] = useState(null);

    useEffect(() => {
        return soundObject
            ? () => {
                  console.log('오디오 언로드');
                  soundObject.unloadAsync();
              }
            : undefined;
    }, [soundObject]);

    // ------------------------------------
    // 2. 오디오 재생/일시정지 로직
    // ------------------------------------
    const playSound = async (clipId, filePath) => {
        if (isPlaying && currentClipId === clipId) {
            console.log('재생 일시정지');
            await soundObject.pauseAsync();
            setIsPlaying(false);
            return;
        }

        if (soundObject && isPlaying) {
            await soundObject.stopAsync();
            await soundObject.unloadAsync();
            setSoundObject(null);
            setIsPlaying(false);
            setCurrentClipId(null);
        }

        try {
            // 🔑 실제 파일 경로로 오디오 로드
            const audioUrl = `${AUDIO_BASE_URL}/${filePath}`;
            console.log('오디오 로드 시도:', audioUrl);

            const { sound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                {
                    // 만약 오디오 파일 접근에 인증이 필요하다면 헤더를 추가합니다.
                    // headers: { 'Authorization': `Bearer ${userToken}` }
                }
            );
            setSoundObject(sound);
            setCurrentClipId(clipId);
            setIsPlaying(true);

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsPlaying(false);
                    setCurrentClipId(null);
                    sound.unloadAsync();
                    setSoundObject(null);
                }
            });

            console.log('오디오 재생 시작');
            await sound.playAsync();
        } catch (err) {
            console.error('오디오 재생 실패', err);
            Alert.alert('오류', '오디오 재생에 실패했습니다. (MP3 파일 경로 확인)');
            setIsPlaying(false);
            setCurrentClipId(null);
        }
    };

    // ------------------------------------
    // 3. 데이터 검증 및 차트 안전 처리
    // ------------------------------------
    if (!resultData) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="moon-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>분석 결과가 없습니다</Text>
                <Text style={styles.emptySubtitle}>
                    메인 화면에서 수면 분석을 시작하고{'\n'}첫 번째 리포트를 확인해보세요!
                </Text>
            </View>
        );
    }

    const chartConfig = {
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(106, 90, 205, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
        decimalPlaces: 1,
    };

    // 🔧 chartData가 [ [Object] ] 구조일 때 안전하게 정리
    const fixedChartData = {
        labels: resultData.chartData?.labels || ["월", "화", "수", "목", "금", "토", "일"],
        datasets: (() => {
            const ds = resultData.chartData?.datasets;
            if (!Array.isArray(ds)) {
                return [{ data: [7.5, 6.8, 8.0, 7.2, 7.1, 6.9, 7.3] }];
            }

            // datasets 내부에 data 배열이 존재하는지 검사
            if (Array.isArray(ds[0]?.data)) {
                return ds;
            }

            // 혹시 [ [Object] ] 형태라면 첫 번째 객체를 정제
            if (Array.isArray(ds[0])) {
                const inner = ds[0][0];
                if (Array.isArray(inner?.data)) return [inner];
            }

            // 기본값 (mock 데이터)
            return [{ data: [7.5, 6.8, 8.0, 7.2, 7.1, 6.9, 7.3] }];
        })(),
    };

    // ------------------------------------
    // 4. 코골이 클립 항목 렌더링
    // ------------------------------------
    const renderClipItem = ({ item }) => {
        const isThisClipPlaying = isPlaying && currentClipId === item.id;
        return (
            <View style={styles.clipItem}>
                <View>
                    <Text style={styles.clipTime}>녹음 시간: {item.time}</Text>
                    <Text style={styles.clipDuration}>지속 시간: {item.duration}초</Text>
                </View>
                <TouchableOpacity style={styles.playButton} onPress={() => playSound(item.id, item.file_path)}>
                    <Ionicons
                        name={isThisClipPlaying ? "pause-circle" : "play-circle"}
                        size={32}
                        color={isThisClipPlaying ? "#dc3545" : "#6A5ACD"}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    // ------------------------------------
    // 5. UI 렌더링
    // ------------------------------------
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>AI 수면 분석 결과</Text>
                <Text style={styles.subtitle}>분석 ID: {analysisId}</Text>
                <Text style={styles.summaryText}>분석 완료 시간: {transferTime}</Text>
            </View>

            {/* 핵심 수치 요약 */}
            <View style={styles.summaryCard}>
                <Text style={styles.cardTitle}>핵심 수면 분석 요약</Text>
                <Text style={styles.summaryValue}>총 수면 시간: {resultData.sleepDuration}</Text>
                <Text style={styles.summaryValue}>코골이 횟수: {resultData.snoreCount}회</Text>
                <Text style={styles.summaryValue}>수면 패턴: {resultData.pattern}</Text>
            </View>

            {/* 주간 수면 시간 변화 차트 */}
            <View style={styles.chartCard}>
                <Text style={styles.cardTitle}>주간 수면 시간 변화 (시간)</Text>
                <LineChart
                    data={fixedChartData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={{ borderRadius: 16 }}
                />
            </View>

            {/* 코골이 클립 목록 */}
            <View style={styles.clipsCard}>
                <Text style={styles.cardTitle}>코골이 감지 클립 ({resultData.clips?.length || 0}개)</Text>
                <FlatList
                    data={resultData.clips || []}
                    renderItem={renderClipItem}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            </View>

            <View style={{ height: 50 }} />
        </ScrollView>
    );
}

// ------------------------------------
// 6. 스타일
// ------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        marginHorizontal: 10,
        marginTop: 40,
        marginBottom: 10,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        marginTop: 5,
        fontSize: 14,
        color: '#666',
    },
    summaryText: {
        marginTop: 5,
        fontSize: 12,
        color: '#999',
    },
    summaryCard: {
        margin: 10,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    chartCard: {
        margin: 10,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    clipsCard: {
        margin: 10,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    summaryValue: {
        fontSize: 16,
        marginBottom: 5,
        color: '#555',
    },
    clipItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    clipTime: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    clipDuration: {
        fontSize: 14,
        color: '#888',
    },
    playButton: {
        padding: 5,
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#555',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 10,
    },
});
