import React from "react";
import { View, Text, StyleSheet } from "react-native";

function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>상호명 : Company name</Text>
      <Text style={styles.text}>대표 : 대표자 명 | 사업자 등록 번호 : 000-00-00000</Text>
      <Text style={styles.text}>주소 : 인천광역시 남동구 앵고개로 928, 3층</Text>
      <Text style={styles.text}>전화 : 070-000-0000 | 이메일 : 000000@naver.com</Text>
      <Text style={styles.text}>개인정보 보호 책임자 : 000</Text>
      <Text style={styles.text}>COPYRIGHT © 상호명. ALL RIGHTS RESERVED. ADMIN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 11,
    color: "#666",
  },
});

export default Footer;
