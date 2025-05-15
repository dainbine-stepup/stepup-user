import db from './initDatabase';

export const insertSalesTarget = (
  startDate,
  endDate,
  amount,
  typeCd,
  statusCd,
) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // 먼저 중복 확인
      tx.executeSql(
        `SELECT COUNT(*) as count FROM tb_sales_target WHERE start_date = ? AND status_cd = 'STTCD001'`,
        [startDate],
        (_, result) => {
          const {count} = result.rows.item(0);
          if (count > 0) {
            // 중복일 경우 reject 처리
            reject(new Error('DUPLICATE'));
            return;
          }

          // 중복이 아니면 insert 실행
          tx.executeSql(
            `INSERT INTO tb_sales_target (start_date, end_date, target_amount, type_cd, status_cd) 
               VALUES (?, ?, ?, ?, ?)`,
            [startDate, endDate, amount, typeCd, statusCd],
            () => {
              resolve('INSERT_SUCCESS');
            },
            (tx, error) => {
              reject(error);
            },
          );
        },
        (tx, error) => {
          reject(error);
        },
      );
    });
  });
};
export const getSalesTargetsByType = typeCd => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM tb_sales_target WHERE type_cd = ? AND status_cd = 'STTCD001' ORDER BY start_date DESC`,
        [typeCd],
        (_, result) => {
          const rows = result.rows;
          const data = [];

          for (let i = 0; i < rows.length; i++) {
            data.push(rows.item(i));
          }

          resolve(data);
        },
        (_, error) => {
          console.log('조회 실패:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const removeSalesTarget = salesTargetId => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE tb_sales_target SET status_cd = ? WHERE sales_target_id = ?`,
        ['STTCD002', salesTargetId], // 상태 코드 'STTCD002'와 주어진 sales_target_id
        (_, result) => {
          if (result.rowsAffected > 0) {
            resolve('상태 코드 업데이트 성공');
          } else {
            resolve('해당 데이터 없음');
          }
        },
        (_, error) => {
          console.log('업데이트 실패:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const updateTargetAmount = (salesTargetId, newAmount) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE tb_sales_target SET target_amount = ? WHERE sales_target_id = ?`,
        [newAmount, salesTargetId],
        (_, result) => {
          if (result.rowsAffected > 0) {
            console.log('목표 금액 업데이트 완료');
            resolve('업데이트 성공');
          } else {
            console.log('해당 데이터 없음');
            resolve('해당 데이터 없음');
          }
        },
        (_, error) => {
          console.log('업데이트 실패:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// 시작일 주고 target_amount 반환하는 함수
export const getTargetAmountByStartDateAndType = (startDate, typeCd) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT target_amount FROM tb_sales_target 
         WHERE start_date = ? AND type_cd = ? AND status_cd = 'STTCD001' 
         LIMIT 1`,
        [startDate, typeCd],
        (_, result) => {
          if (result.rows.length > 0) {
            const {target_amount} = result.rows.item(0);
            resolve(target_amount);
          } else {
            resolve(null); // 해당 조건에 맞는 데이터 없음
          }
        },
        (_, error) => {
          console.log('target_amount 조회 실패:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};
