import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

function AdviceBoard() {

    return (
        <View style={styles.container}>
            <View style={styles.title}>
                <Text style={styles.titleText}>상담 게시판</Text>
            </View>
            <View style={styles.header}>
                <View style={styles.headerItem}>
                    <Text style={styles.headerText}>업체명</Text>
                </View>
                <View style={styles.headerItem}>
                    <Text style={styles.headerText}>제목</Text>
                </View>
                <View style={styles.headerItem}>
                    <Text style={styles.headerText}></Text>
                </View>
            </View>
            <View style={styles.row}>
                <View style={styles.rowItem}>
                    <Text style={styles.companyText}>브랜드위즈</Text>
                </View>
                <View style={styles.rowItem}>
                    <Text style={styles.companyTitleText}>마케팅 문의</Text>
                </View>
                <View style={styles.rowItemIcon}>
                    <Image
                        source={require('../img/icon1.png')}
                        style={styles.iconImage}
                        resizeMode="contain"
                    />
                </View>
            </View>
            <View style={styles.row}>
                <View style={styles.rowItem}>
                    <Text style={styles.companyText}>광흥창메이커</Text>
                </View>
                <View style={styles.rowItem}>
                    <Text style={styles.companyTitleText}>온라인 유통문의</Text>
                </View>
                <View style={styles.rowItemIcon}>
                    <Image
                        source={require('../img/icon1.png')}
                        style={styles.iconImage}
                        resizeMode="contain"
                    />
                </View>
            </View>
            <View style={styles.row}>
                <View style={styles.rowItem}>
                    <Text style={styles.companyText}>패드리퍼블릭</Text>
                </View>
                <View style={styles.rowItem}>
                    <Text style={styles.companyTitleText}>제조공장 문의</Text>
                </View>
                <View style={styles.rowItemIcon}>
                    <Image
                        source={require('../img/icon1.png')}
                        style={styles.iconImage}
                        resizeMode="contain"
                    />
                </View>
            </View>
            <View style={styles.row}>
                <View style={styles.rowItem}>
                    <Text style={styles.companyText}>수호티엘</Text>
                </View>
                <View style={styles.rowItem}>
                    <Text style={styles.companyTitleText}>해외 유통처 문의</Text>
                </View>
                <View style={styles.rowItemIcon}>
                    <Image
                        source={require('../img/icon1.png')}
                        style={styles.iconImage}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: "#FFF",
        borderRadius: 8,
    },
    title: {
        padding: 10,
    },
    titleText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    header: {
        paddingVertical: 5,
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#ccc",
    },
    headerItem: {
        width: "33%",
        paddingLeft: 20,
        justifyContent: "center",
    },
    row: {
        paddingVertical: 10,
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#ccc",
    },
    rowItem: {
        width: "33%",
        paddingLeft: 15,
        justifyContent: "center",
    },
    rowItemIcon: {
        width: "33%",
        paddingRight: 15,
        justifyContent: "center",
        alignItems: "flex-end",
    },
    iconImage: {
        width: 20,
        height: 20,
    },
    companyText: {
        fontSize: 13,
    },
    companyTitleText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#666",
    },
    headerText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#666"
    }
});

export default AdviceBoard;