// src/pages/Auth/signup.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 유효한 React 컴포넌트 함수를 정의하고 export default로 내보냅니다.
export default function SignupScreen() {
  return (
    <View style={styles.container}>
      <Text>회원가입 화면</Text>
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