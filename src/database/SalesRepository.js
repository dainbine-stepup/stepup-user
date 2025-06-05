import {openDatabase} from 'react-native-sqlite-storage';

const db = openDatabase({name: 'stepup.db'});

// 모든 데이터 조회
export const getAllSales = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM tb_sales ORDER BY date DESC',
        [],
        (tx, results) => {
          const rows = results.rows;
          let data = [];
          for (let i = 0; i < rows.length; i++) {
            data.push(rows.item(i));
          }
          resolve(data);
        },
        error => {
          reject(error);
        }
      );
    });
  });
};

// 해당 날짜 데이터 조회
export const findSalesByDate = (date) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM tb_sales WHERE date = ?`,
        [date],
        (tx, results) => {
          if (results.rows.length > 0) {
            resolve(results.rows.item(0)); // 존재
          } else {
            resolve(null); // 없음
          }
        },
        error => reject(error)
      );
    });
  });
};

// 데이터 삽입
export const insertSales = (date, target, amount) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO tb_sales (date, target, amount) VALUES (?, ?, ?)`,
        [date, target, amount],
        (tx, results) => {
          resolve(results);
        },
        (error) => {
          reject(error);
        }
      );
    });
  });
};

// 데이터 업데이트
export const updateSales = (date, target, amount) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE tb_sales SET target = ?, amount = ? WHERE date = ?`,
        [target, amount, date],
        (tx, results) => resolve(results),
        error => reject(error)
      );
    });
  });
};