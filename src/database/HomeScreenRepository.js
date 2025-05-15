import {openDatabase} from 'react-native-sqlite-storage';

const db = openDatabase({name: 'stepup.db'});

const HomeScreenRepository = {

    // 매출 실적 합계 계산
    getDailySalesByPeriod: (periodType, start, end, successCallback, errorCallback) => {
        const statusCd = 'STTCD001';

        let query = `
            SELECT sales_date, sales_amount
            FROM tb_sales_record
            WHERE status_cd = ? AND sales_date BETWEEN ? AND ?
            ORDER BY sales_date ASC
        `;
        let params = [statusCd, start, end];

        db.transaction(tx => {
            tx.executeSql(
                query,
                params,
                (_, result) => {
                    const records = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        records.push(result.rows.item(i));
                    }
                    successCallback(records);
                },
                (_, error) => {
                    if (errorCallback) errorCallback(error);
                    return true;
                }
            );
        });
    },

    // 매출 목표 조회
    getSalesTargetByPeriod: (periodType, start, end, successCallback, errorCallback) => {

        const statusCd = 'STTCD001';
        const typeCd = periodType === '월' ? 'TYPCD001' : 'TYPCD002';

        let query = `
            SELECT target_amount FROM tb_sales_target
            WHERE status_cd = ?
            AND type_cd = ?
            AND start_date = ? AND end_date = ?
            ORDER BY start_date DESC
            LIMIT 1
        `;
        let params = [statusCd, typeCd, start, end];
        console.log('매출 목표 params: ', params)
        db.transaction(tx => {
            tx.executeSql(
            query,
            params,
            (_, result) => {
                const amount = result.rows.length > 0 ? result.rows.item(0).target_amount : 0;
                successCallback(amount);
            },
            (_, error) => {
                if (errorCallback) errorCallback(error);
                return true;
            }
            );
        });
    },
}

export default HomeScreenRepository;