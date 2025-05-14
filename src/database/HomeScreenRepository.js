import {openDatabase} from 'react-native-sqlite-storage';

const db = openDatabase({name: 'stepup.db'});

const HomeScreenRepository = {

    // 매출 실적 합계 계산
    getDailySalesByPeriod: (periodType, period, successCallback, errorCallback) => {
        const statusCd = 'STTCD001';

        let query = '';
        let params = [statusCd];

        if (periodType === 'month') {
            // period = '2025-05'
            const [yearStr, monthStr] = period.split('-');
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10);

            // 다음 달의 0일 → 이번 달의 마지막 날짜
            const lastDate = new Date(year, month, 0).getDate(); // 예: 31, 30, 28, 29
            const start = `${period}-01`;
            const end = `${period}-${String(lastDate).padStart(2, '0')}`;

            query = `
                SELECT sales_date, sales_amount
                FROM tb_sales_record
                WHERE status_cd = ? AND sales_date BETWEEN ? AND ?
                ORDER BY sales_date ASC
            `;
            params.push(start, end);
        } else if (periodType === 'week') {
            const [start, end] = period.split(' ~ ');
            query = `
                SELECT sales_date, sales_amount
                FROM tb_sales_record
                WHERE status_cd = ? AND sales_date BETWEEN ? AND ?
                ORDER BY sales_date ASC
            `;
            params.push(start, end);
        }

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
    getSalesTargetByPeriod: (periodType, period, successCallback, errorCallback) => {

        const statusCd = 'STTCD001';
        const monthTypeCd = 'TYPCD001';
        const weekTypeCd = 'TYPCD002';
        let query = '';
        let params = [statusCd];

        if (periodType === 'month') {
            // period = '2025-05'
            const start = `${period}-01`;
            const end = `${period}-31`;
            query = `
            SELECT target_amount FROM tb_sales_target
            WHERE status_cd = ?
            AND type_cd = ?
            AND start_date <= ? AND end_date >= ?
            ORDER BY start_date DESC
            LIMIT 1
            `;
            params.push(monthTypeCd, end, start);
        } else if (periodType === 'week') {
            // period = '2025-05-06 ~ 2025-05-12'
            const [start, end] = period.split(' ~ ');
            query = `
            SELECT target_amount FROM tb_sales_target
            WHERE status_cd = ?
            AND type_cd = ?
            AND start_date <= ? AND end_date >= ?
            ORDER BY start_date DESC
            LIMIT 1
            `;
            params.push(weekTypeCd, end, start);
        }

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