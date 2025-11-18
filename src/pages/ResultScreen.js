// src/pages/ResultScreen.js (🔥 완전 MOCK 버전)

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

const screenWidth = Dimensions.get('window').width;

export default function ResultScreen() {
    const route = useRoute();
    const { analysisId, resultData, transferTime } = route.params || {};

    // 🔥 MOCK: 로컬 테스트용 오디오 파일 (프로젝트 assets 폴더에 추가 필요)
    // 없으면 그냥 try/catch로 재생 오류만 표시하고 앱은 정상 동작함.
    const MOCK_SOUND = require('../../assets/mock_short_sound.mp3'); 

    // ------------------------------------
    // 1. 오디오 재생 상태
    // ------------------------------------
    const [soundObject, setSoundObject] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentClipId, setCurrentClipId] = useState(null);

    useEffect(() => {
        return soundObject
            ? () => {
                  soundObject.unloadAsync();
              }
            : undefined;
    }, [soundObject]);

    // ------------------------------------
    // 2. 오디오 재생 (Mock)
    // ------------------------------------
    const playSound = async (clipId) => {
        // 이미 재생 중이면 pause
        if (isPlaying && currentClipId === clipId) {
            await soundObject.pauseAsync();
            setIsPlaying(false);
            return;
        }

        // 다른 오디오 재생 중이면 정지
        if (soundObject) {
            await soundObject.stopAsync();
            await soundObject.unloadAsync();
        }

        try {
            const { sound } = await Audio.Sound.createAsync(MOCK_SOUND);
            setSoundObject(sound);
            setCurrentClipId(clipId);
            setIsPlaying(true);

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsPlaying(false);
                    setCurrentClipId(null);
                    sound.unloadAsync();
                }
            });

            await sound.playAsync();
        } catch (err) {
            console.log('오디오 재생 오류', err);
            Alert.alert('오류', '로컬 테스트 오디오 파일이 없거나 재생할 수 없습니다.');
        }
    };

    // ------------------------------------
    // 3. 데이터 검증 및 Mock 대체
    // ------------------------------------
    const mockSafe = (value, fallback) => (value !== undefined ? value : fallback);

    const safeResult = {
        sleepDuration: mockSafe(resultData?.sleepDuration, "7시간 30분"),
        snoreCount: mockSafe(resultData?.snoreCount, Math.floor(Math.random() * 20)),
        pattern: mockSafe(resultData?.pattern, "안정적인 수면 패턴"),
        chartData: resultData?.chartData || {
            labels: ["W", "T", "W", "T", "F", "S", "S"],
            legend: ["월금", "토", "일"],
            datasets: [{ data: [7, 6, 8, 7, 7, 6, 7] }],
        },
        clips: resultData?.clips || [
            { id: 1, time: "02:14", duration: 3 },
            { id: 2, time: "04:51", duration: 2 },
            { id: 3, time: "05:33", duration: 4 },
        ],
    };

    // ------------------------------------
    // 4. 차트 설정
    // ------------------------------------
    const chartConfig = {
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(106, 90, 205, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
        decimalPlaces: 1,
    };

    // ------------------------------------
    // 5. 코골이 클립 렌더링
    // ------------------------------------
    const renderClipItem = ({ item }) => {
        const isThisClipPlaying = isPlaying && currentClipId === item.id;
        return (
            <View style={styles.clipItem}>
                <View>
                    <Text style={styles.clipTime}>녹음 시간: {item.time}</Text>
                    <Text style={styles.clipDuration}>지속 시간: {item.duration}초</Text>
                </View>

                <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => playSound(item.id)}
                >
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
    // 6. UI 렌더링
    // ------------------------------------
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>AI 수면 분석 결과</Text>
                <Text style={styles.subtitle}>분석 ID: {analysisId}</Text>
                <Text style={styles.summaryText}>분석 완료 시간: {transferTime}</Text>
            </View>

            {/* 요약 카드 */}
            <View style={styles.summaryCard}>
                <Text style={styles.cardTitle}>핵심 수면 분석 요약</Text>
                <Text style={styles.summaryValue}>총 수면 시간: {safeResult.sleepDuration}</Text>
                <Text style={styles.summaryValue}>코골이 횟수: {safeResult.snoreCount}회</Text>
                <Text style={styles.summaryValue}>수면 패턴: {safeResult.pattern}</Text>
            </View>

            {/* 차트 */}
            <View style={styles.chartCard}>
                <Text style={styles.cardTitle}>주간 수면 시간 변화 (시간)</Text>
                <LineChart
                    data={safeResult.chartData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={{ borderRadius: 16 }}
                />
            </View>

            {/* 코골이 클립 */}
            <View style={styles.clipsCard}>
                <Text style={styles.cardTitle}>코골이 감지 클립 ({safeResult.clips.length}개)</Text>
                <FlatList
                    data={safeResult.clips}
                    renderItem={renderClipItem}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            </View>

            <View style={{ height: 70 }} />
        </ScrollView>
    );
}

// ------------------------------------
// 7. 스타일
// ------------------------------------
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8' },
    header: {
        margin: 10,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 3,
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    subtitle: { marginTop: 5, fontSize: 14, color: '#666' },
    summaryText: { marginTop: 5, fontSize: 12, color: '#999' },

    summaryCard: {
        margin: 10,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 3,
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    summaryValue: { fontSize: 16, marginBottom: 5, color: '#555' },

    chartCard: {
        margin: 10,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        elevation: 3,
    },

    clipsCard: {
        margin: 10,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 3,
    },

    clipItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    clipTime: { fontSize: 16, fontWeight: '500', color: '#333' },
    clipDuration: { fontSize: 14, color: '#888' },
    playButton: { padding: 5 },

    separator: { height: 1, backgroundColor: '#eee', marginVertical: 5 },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 20,
    },
    emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#555', marginTop: 20 },
    emptySubtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 10 },
});
