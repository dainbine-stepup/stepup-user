import {openDatabase} from 'react-native-sqlite-storage';

const db = openDatabase({name: 'sales.db'});

const SalesRecordRepository = {

    insertSalesRecord: (salesDate, salesAmount, successCallback, errorCallback) => {
        db.transaction((tx) => {
            tx.executeSql(
                `INSERT INTO tb_sales_record (sales_date, sales_amount, status_cd) VALUES (?, ?, 'STTCD001')`,
                [salesDate, salesAmount],
                (tx, results) => {
                    if (results.rowsAffected > 0) {
                        if (successCallback) successCallback(results);
                    } else {
                        if (errorCallback) errorCallback('삽입 실패');
                    }
                },
                (tx, error) => {
                    if (errorCallback) errorCallback(error);
                }
            );
        });
    },

    getSalesRecord: (callback) => {
        db.transaction((tx) => {
            tx.executeSql(
                `SELECT * FROM tb_sales_record ORDER BY sales_date DESC`,
                [],
                (tx, results) => {
                    let salesRecords = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        salesRecords.push(results.rows.item(i));
                    }
                    if (callback) callback(salesRecords);
                }
            );
        });
    }
}

export default SalesRecordRepository;