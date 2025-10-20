// src/pages/main.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 유효한 React 컴포넌트 함수를 정의하고 export default로 내보냅니다.
export default function MainScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>환영합니다! 수면 분석 메인 화면입니다.</Text>
      {/* 여기에 녹음 버튼과 다른 UI가 들어갈 예정입니다. */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});