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
            SELECT sales_amount FROM tb_sales_target_history
            WHERE status_cd = ?
            AND sales_date BETWEEN ? AND  ?
        `;
        let params = [statusCd, start, end];
        db.transaction(tx => {
            tx.executeSql(
            query,
            params,
            (_, result) => {
                let totalAmount = 0;
                for (let i = 0; i < result.rows.length; i++) {
                    totalAmount += result.rows.item(i).sales_amount;
                }
                successCallback(totalAmount);
            },
            (_, error) => {
                if (errorCallback) errorCallback(error);
                return true;
            }
            );
        });
    },

    // 매출 목표 start end 범위로 조회
    getTargetByPerioid: (start, end, successCallback, errorCallback) => {
        const statusCd = 'STTCD001';

        let query = `
            SELECT sales_amount AS target, sales_date AS date FROM tb_sales_target_history
            WHERE status_cd = ?
            AND sales_date BETWEEN ? AND ?
            ORDER BY sales_date ASC
        `;

        let params = [statusCd, start, end];

        db.transaction(tx => {
            tx.executeSql(
            query,
            params,
            (_, result) => {
                const targetList = [];
                const targetDates = [];

                for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows.item(i);
                targetList.push(row.target);
                targetDates.push(row.date);
                }

                successCallback(targetList, targetDates);
            },
            (_, error) => {
                if (errorCallback) errorCallback(error);
                return true;
            }
            );
        });

    },

    // 매출 실적 start end 범위로 조회
    getRecordByPeriod: (start, end, successCallback, errorCallback) => {
        const statusCd = 'STTCD001';

        const query = `
            SELECT sales_amount AS record, sales_date AS date
            FROM tb_sales_record
            WHERE status_cd = ? AND sales_date BETWEEN ? AND ?
            ORDER BY sales_date ASC
        `;
        const params = [statusCd, start, end];

        db.transaction(tx => {
            tx.executeSql(
            query,
            params,
            (_, result) => {
                const recordList = [];
                const recordDates = [];

                for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows.item(i);
                recordList.push(row.record);
                recordDates.push(row.date);
                }
                successCallback(recordList, recordDates);
            },
            (_, error) => {
                if (errorCallback) errorCallback(error);
                return true;
            }
            );
        });
    }


}

export default HomeScreenRepository;