import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

function MyPageScreen() {
    return (
        <View style={styles.container}>
            <Text>마이페이지</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
    }
})

export default MyPageScreen;