import db from './initDatabase';

export const getSalesAmountSumByPeriod = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT SUM(sales_amount) AS total_sales
         FROM tb_sales_record
         WHERE status_cd = 'STTCD001' AND sales_date BETWEEN ? AND ?`,
        [startDate, endDate],
        (_, result) => {
          const row = result.rows.item(0);
          resolve(row.total_sales ?? 0); // 결과 없으면 0으로 반환
        },
        (_, error) => {
          console.log('매출 합계 조회 실패:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};
