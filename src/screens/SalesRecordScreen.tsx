import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    Alert,
    FlatList,
    StyleSheet,
    ListRenderItem
} from 'react-native';
import SalesRecordRepository from '../database/SalesRecordRepository';

// 판매 기록 데이터 타입 정의
type SalesRecord = {
    sales_record_id: number;
    sales_date: string;
    sales_amount: number;
    status_cd: string;
    reg_dt: string;
};

function SalesRecordScreen() {
    const [salesDate, setSalesDate] = useState<string>('');
    const [salesAmount, setSalesAmount] = useState<string>('');
    const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);

    // 매출 저장 처리
    const handleSave = () => {
        if (!salesDate || !salesAmount) {
            Alert.alert('입력 오류', '날짜와 금액을 입력하세요.');
            return;
        }

        SalesRecordRepository.insertSalesRecord(
            salesDate,
            parseInt(salesAmount),
            () => {
                Alert.alert('저장 완료', '매출이 저장되었습니다.');
                setSalesDate('');
                setSalesAmount('');
                getSalesRecords();
            },
            (error: unknown) => {
                Alert.alert('저장 실패', '오류: ' + error);
            }
        );
    };

    // 매출 데이터 가져오기
    const getSalesRecords = () => {
        SalesRecordRepository.getSalesRecord((records: SalesRecord[]) => {
            setSalesRecords(records);
        });
    };

    useEffect(() => {
        getSalesRecords();
    }, []);

    // FlatList에서 각 아이템을 렌더링하는 함수
    const renderItem: ListRenderItem<SalesRecord> = ({item}) => (
        <View style={styles.recordItem}>
            <Text>날짜: {item.sales_date}</Text>
            <Text>금액: {item.sales_amount}원</Text>
            <Text>상태코드: {item.status_cd}</Text>
            <Text>등록일: {item.reg_dt}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>매출 관리 페이지</Text>

            <Text>매출 날짜 (YYYY-MM-DD)</Text>
            <TextInput
                style={styles.input}
                value={salesDate}
                onChangeText={setSalesDate}
                placeholder="예: 2025-05-08"
            />

            <Text>매출 금액</Text>
            <TextInput
                style={styles.input}
                value={salesAmount}
                onChangeText={setSalesAmount}
                placeholder="예: 50000"
                keyboardType="numeric"
            />

            <Button title="저장" onPress={handleSave} />

            <Text style={styles.subtitle}>매출 목록</Text>
            <FlatList
                data={salesRecords}
                keyExtractor={(item) => item.sales_record_id.toString()}
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
    },
    subtitle: {
        marginTop: 30,
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
    },
    recordItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
});

export default SalesRecordScreen;
