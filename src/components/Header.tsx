import React from "react";
import { View, Text, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";

function Header() {
  
    return (
        <LinearGradient
            colors={["#5ee6dc", "#01b9e9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
        >
            <Text style={styles.title}>브랜드 위즈</Text>
            <Text><Text>가입일</Text> 2025.03.03</Text>
        </LinearGradient>
    );
}
const styles = StyleSheet.create({
  header: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00c6ff",
    borderRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
  },
});

export default Header;