import React from "react";
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// 컴포넌트
import Header from "../components/Header";
import Footer from "../components/Footer";

function MainScreen() {

    return (
        <ScrollView style={styles.container}>
            <Header />
            <View style={styles.content}>
                <Text>메인</Text>
            </View>
            <Footer />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        flex: 1,
    },
    content: {
        flex: 1,
        
    },
})

export default MainScreen;