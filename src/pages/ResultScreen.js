// src/pages/ResultScreen.js (달력 및 리스트 통합 버전 - 전체 스크롤)

import React, { useState } from 'react';
// 🔑 ScrollView 추가
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native'; 
import { useRoute } from '@react-navigation/native';
// 🔑 설치한 달력 라이브러리에서 CalendarList를 불러옵니다.
import { Calendar, LocaleConfig } from 'react-native-calendars'; 

// 달력 언어를 한국어로 설정 (선택 사항)
LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  dayNames: ['일', '월', '화', '수', '목', '금', '토'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
};
LocaleConfig.defaultLocale = 'ko';


// 🔑 임시 분석 결과 리스트 (달력에 표시될 데이터라고 가정)
// 실제로는 백엔드에서 특정 날짜의 데이터를 가져와야 합니다.
const MOCK_DAILY_RESULTS = {
    // 날짜: 분석 리스트 (이 날짜에 여러 번 녹음했을 수 있음)
    '2025-10-22': [
        { id: 'a1', time: '오전 08:00', duration: '7.5 시간', quality: '매우 좋음' },
        { id: 'a2', time: '오전 08:05', duration: '10분', quality: '오류' },
        { id: 'a3', time: '오전 08:00', duration: '7.5 시간', quality: '매우 좋음' },
        { id: 'a4', time: '오전 08:05', duration: '10분', quality: '오류' },
        { id: 'a5', time: '오전 08:00', duration: '7.5 시간', quality: '매우 좋음' },
        { id: 'a6', time: '오전 08:05', duration: '10분', quality: '오류' },
        { id: 'a7', time: '오전 08:00', duration: '7.5 시간', quality: '매우 좋음' },
        { id: 'a8', time: '오전 08:05', duration: '10분', quality: '오류' },
    ],
    '2025-10-21': [
        { id: 'b1', time: '오전 07:30', duration: '6.8 시간', quality: '보통' },
    ],
    '2025-10-18': [
        { id: 'c1', time: '오전 09:00', duration: '8.1 시간', quality: '좋음' },
    ],
};


export default function ResultScreen() {
    const route = useRoute();
    const { analysisId, resultData } = route.params || {}; 
    
    // 🔑 달력에서 선택된 날짜 상태 (오늘 날짜로 초기화)
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);

    // 🔑 선택된 날짜의 분석 리스트 (MOCK 데이터 사용)
    const selectedDayResults = MOCK_DAILY_RESULTS[selectedDate] || [];

    // ------------------------------------
    // 렌더링 함수: 분석 결과 리스트 아이템
    // ------------------------------------
    const renderResultItem = ({ item }) => (
        <TouchableOpacity style={styles.listItem} onPress={() => Alert.alert('상세 보기', `${item.time}에 기록된 수면 질: ${item.quality}`)}>
            <Text style={styles.listTime}>{item.time} 기록</Text>
            <Text style={styles.listDetail}>수면 시간: {item.duration}</Text>
            <Text style={[styles.listQuality, item.quality === '매우 좋음' && { color: '#28a745' }]}>
                질: {item.quality}
            </Text>
        </TouchableOpacity>
    );
    
    // ------------------------------------
    // 렌더링: 요약 영역
    // ------------------------------------
    const renderSummary = () => (
        <View style={styles.summaryContainer}>
            <Text style={styles.title}>최근 분석 요약</Text>
            {resultData ? (
                <View style={styles.resultBox}>
                    <Text style={styles.summaryText}>수면 시간: {resultData.sleepDuration}</Text>
                    <Text style={styles.summaryText}>코골이 횟수: {resultData.snoreCount} 회</Text>
                    <Text style={styles.summaryPattern}>패턴: {resultData.pattern}</Text>
                </View>
            ) : (
                <Text style={styles.subtitle}>분석 요청 대기 중...</Text>
            )}
        </View>
    );

    // ------------------------------------
    // 렌더링: 달력 및 리스트 영역
    // ------------------------------------
    const renderCalendarAndList = () => (
        <View style={styles.calendarContainer}>
            {/* 🔑 달력 컴포넌트 */}
            <Calendar
                style={styles.calendar}
                current={today}
                onDayPress={(day) => {
                    setSelectedDate(day.dateString);
                    // 🔑 여기서 백엔드 API를 호출하여 해당 날짜의 실제 분석 리스트를 가져와야 합니다.
                }}
                markedDates={{
                    [selectedDate]: { selected: true, disableTouchEvent: true, selectedDotColor: 'orange' },
                    // MOCK 데이터가 있는 날짜에 점 표시
                    '2025-10-22': { marked: true, dotColor: '#28a745' },
                    '2025-10-21': { marked: true, dotColor: '#28a745' },
                    '2025-10-18': { marked: true, dotColor: '#28a745' },
                }}
                theme={{
                    selectedDayBackgroundColor: '#007AFF',
                    todayTextColor: '#007AFF',
                    arrowColor: '#007AFF',
                }}
            />
            
            <Text style={styles.listHeader}>{selectedDate}의 분석 기록 ({selectedDayResults.length}건)</Text>

            {/* 🔑 리스트 (FlatList) */}
            <FlatList
                data={selectedDayResults}
                renderItem={renderResultItem}
                // 🔑 keyExtractor를 index와 item.id를 모두 사용하여 고유성을 높입니다.
                // item.id가 확실히 고유하다면 item.id만 사용해도 되지만, 오류를 해결하기 위해 조합합니다.
                keyExtractor={(item, index) => `${selectedDate}-${item.id}-${index}`} 
                style={styles.list}
                scrollEnabled={false} 
                ListEmptyComponent={() => <Text style={styles.listEmpty}>이 날짜에는 분석 기록이 없습니다.</Text>}
            />
        </View>
    );
    
    return (
        // 🔑 최상위 컴포넌트를 ScrollView로 변경
        <ScrollView style={styles.fullScreenScroll}>
            {renderSummary()}
            {renderCalendarAndList()}
        </ScrollView>
    );
}

// ------------------------------------
// 스타일
// ------------------------------------
const styles = StyleSheet.create({
    fullScreenScroll: {
        flex: 1,
        backgroundColor: '#303030ff',
    },
    // 🔑 분석 요약 부분 스타일 수정
    summaryContainer: {
        padding: 15, // 🔑 패딩을 줄여 전체적인 크기 감소
        marginHorizontal: 20, // 🔑 좌우 마진을 추가하여 중앙 정렬 및 너비 감소
        marginTop: 50, // 🔑 상단 마진 추가 (옵션)
        marginBottom: 10, // 🔑 하단 마진 추가 (옵션)
        backgroundColor: '#fff',
        borderRadius: 20, // 🔑 모서리 둥글게 (기존 15에서 20으로 증가)
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 }, // 🔑 그림자 방향 조정
    },
    title: {
        fontSize: 20, // 🔑 폰트 크기 약간 감소 (옵션)
        fontWeight: 'bold',
        marginBottom: 8, // 🔑 마진 조정
        color: '#007AFF',
    },
    subtitle: {
        color: 'gray',
        fontSize: 14, // 🔑 폰트 크기 약간 감소 (옵션)
    },
    resultBox: {
        width: '100%',
        alignItems: 'center',
    },
    summaryText: {
        fontSize: 16, // 🔑 폰트 크기 약간 감소 (옵션)
        fontWeight: '500',
        marginVertical: 3, // 🔑 마진 조정
        color: '#333',
    },
    summaryPattern: {
        fontSize: 16, // 🔑 폰트 크기 약간 감소 (옵션)
        fontWeight: 'bold',
        marginTop: 8, // 🔑 마진 조정
        color: '#dc3545',
    },
    // 하단 2/3 영역 스타일
    calendarContainer: {
        // flex: 2, // 🔑 제거: 콘텐츠 높이만큼만 차지하도록 변경
        padding: 10,
    },
    calendar: {
        borderRadius: 10,
        elevation: 3,
        marginHorizontal: 10,
        marginBottom: 10,
    },
    listHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
        color: '#ffffffff',
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 10,
        marginBottom: 8,
        borderLeftWidth: 5,
        borderLeftColor: '#007AFF',
    },
    listTime: {
        fontWeight: 'bold',
        width: 80,
    },
    listDetail: {
        color: '#6c757d',
    },
    listQuality: {
        fontWeight: 'bold',
        color: '#ffc107',
    },
    listEmpty: {
        textAlign: 'center',
        marginTop: 20,
        color: 'gray',
    }
});