import moment from 'moment';
import db from './initDatabase';

// 하루 단위 목표 매출 입력 (INSERT 또는 UPDATE) - 순차처리로 안정성 개선
export const insertSalesTarget = (
  startDate,
  endDate,
  totalAmount,
  statusCd,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const startDateObj = moment(startDate, 'YYYY-MM-DD');
      const endDateObj = moment(endDate, 'YYYY-MM-DD');

      if (!startDateObj.isValid() || !endDateObj.isValid()) {
        reject(new Error('INVALID_DATE_FORMAT'));
        return;
      }

      if (startDateObj.isAfter(endDateObj)) {
        reject(new Error('INVALID_DATE_RANGE'));
        return;
      }

      const dayCount = endDateObj.diff(startDateObj, 'days') + 1;
      const amountPerDay = Math.floor(totalAmount / dayCount);
      const leftover = totalAmount - amountPerDay * dayCount;

      const dates = [];
      for (let i = 0; i < dayCount; i++) {
        const dateStr = moment(startDateObj)
          .add(i, 'days')
          .format('YYYY-MM-DD');
        dates.push(dateStr);
      }

      for (let idx = 0; idx < dates.length; idx++) {
        const date = dates[idx];
        const dailyAmount = idx === 0 ? amountPerDay + leftover : amountPerDay;

        await new Promise((res, rej) => {
          db.transaction(tx => {
            tx.executeSql(
              `SELECT COUNT(*) AS cnt FROM tb_sales_target_history WHERE sales_date = ? AND status_cd = 'STTCD001'`,
              [date],
              (_, result) => {
                const count = result.rows.item(0).cnt;

                if (count > 0) {
                  tx.executeSql(
                    `UPDATE tb_sales_target_history 
                     SET sales_amount = ?, status_cd = ?, mod_dt = datetime('now', 'localtime') 
                     WHERE sales_date = ? AND status_cd = 'STTCD001'`,
                    [dailyAmount, statusCd, date],
                    () => res(),
                    (_, error) => {
                      console.log(`UPDATE 실패: ${date}`, error);
                      rej(error);
                    },
                  );
                } else {
                  tx.executeSql(
                    `INSERT INTO tb_sales_target_history (sales_date, sales_amount, status_cd) 
                     VALUES (?, ?, ?)`,
                    [date, dailyAmount, statusCd],
                    () => res(),
                    (_, error) => {
                      console.log(`INSERT 실패: ${date}`, error);
                      rej(error);
                    },
                  );
                }
              },
              (_, error) => {
                console.log(`조회 실패: ${date}`, error);
                rej(error);
              },
            );
          });
        });
      }

      resolve('INSERT_OR_UPDATE_COMPLETE');
    } catch (error) {
      reject(error);
    }
  });
};

// 목표 내역 조회 (월간, 주간, 일간)
export const getSalesTargetsByType = (typeCd, statusCd = 'STTCD001') => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      let query = '';
      if (typeCd === 'TYPCD001') {
        query = `
          SELECT strftime('%Y-%m', sales_date) AS period, SUM(sales_amount) AS total_amount
          FROM tb_sales_target_history
          WHERE status_cd = ?
          GROUP BY period
          ORDER BY period DESC
        `;
      } else if (typeCd === 'TYPCD002') {
        // 일단 일별로 모두 가져오기
        query = `
          SELECT sales_date, sales_amount
          FROM tb_sales_target_history
          WHERE status_cd = ?
          ORDER BY sales_date DESC
        `;
      } else if (typeCd === 'TYPCD003') {
        query = `
          SELECT sales_date AS period, SUM(sales_amount) AS total_amount
          FROM tb_sales_target_history
          WHERE status_cd = ?
          GROUP BY sales_date
          ORDER BY sales_date DESC
        `;
      } else {
        reject(new Error('Invalid typeCd'));
        return;
      }

      tx.executeSql(
        query,
        [statusCd],
        (_, result) => {
          const rows = result.rows;
          if (typeCd === 'TYPCD002') {
            // JS에서 ISO 주차별 그룹핑
            const weeklyMap = new Map();

            for (let i = 0; i < rows.length; i++) {
              const item = rows.item(i);
              const date = moment(item.sales_date);
              if (!date.isValid()) continue;

              // ISO 주차 및 연도 가져오기
              const year = date.isoWeekYear();
              const week = date.isoWeek();
              const key = `${year}-${week.toString().padStart(2, '0')}`;

              if (!weeklyMap.has(key)) {
                weeklyMap.set(key, {
                  total_amount: 0,
                  startDate: null,
                  endDate: null,
                });
              }
              const group = weeklyMap.get(key);
              group.total_amount += item.sales_amount;

              // 해당 주의 시작일, 종료일 (월~일)
              if (!group.startDate || date.isBefore(group.startDate)) {
                group.startDate = date.clone().startOf('isoWeek');
              }
              if (!group.endDate || date.isAfter(group.endDate)) {
                group.endDate = date.clone().endOf('isoWeek');
              }
            }

            const data = [];
            for (const [key, val] of weeklyMap.entries()) {
              data.push({
                period: `${val.startDate.format(
                  'YYYY-MM-DD',
                )} ~ ${val.endDate.format('YYYY-MM-DD')}`,
                total_amount: val.total_amount,
              });
            }

            // 최신 주차부터 정렬
            data.sort((a, b) => (a.period < b.period ? 1 : -1));

            resolve(data);
          } else {
            const data = [];
            for (let i = 0; i < rows.length; i++) {
              const item = rows.item(i);
              data.push({
                period: item.period,
                total_amount: item.total_amount,
              });
            }
            resolve(data);
          }
        },
        (_, error) => {
          console.error('조회 실패:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// 목표 내역 삭제 (기간 내 해당하는 데이터 status_cd 변경)
// type_cd 조건 제거 (테이블에 없으므로)
export const removeSalesTargetHistoryByPeriod = (typeCd, period) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      let startDate = '';
      let endDate = '';

      if (typeCd === 'TYPCD001') {
        startDate = `${period}-01`;
        endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
      } else if (typeCd === 'TYPCD002') {
        [startDate, endDate] = period.split(' ~ ');
      } else if (typeCd === 'TYPCD003') {
        startDate = endDate = period;
      }

      tx.executeSql(
        `UPDATE tb_sales_target_history
         SET status_cd = 'STTCD002'
         WHERE sales_date BETWEEN ? AND ? AND status_cd = 'STTCD001'`,
        [startDate, endDate],
        (_, result) => {
          resolve(`${result.rowsAffected}건 삭제됨`);
        },
        (_, error) => {
          console.log('삭제 실패:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// 목표 내역 수정 (기간 내 삭제 후 재삽입)
export const updateSalesTargetHistoryByPeriod = (typeCd, period, newAmount) => {
  return new Promise(async (resolve, reject) => {
    try {
      let startDate = '';
      let endDate = '';

      if (typeCd === 'TYPCD001') {
        startDate = `${period}-01`;
        endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
      } else if (typeCd === 'TYPCD002') {
        [startDate, endDate] = period.split(' ~ ');
      } else if (typeCd === 'TYPCD003') {
        startDate = endDate = period;
      } else {
        reject(new Error('Invalid typeCd'));
        return;
      }

      const dateList = [];
      let current = moment(startDate);
      const last = moment(endDate);

      while (current.isSameOrBefore(last)) {
        dateList.push(current.format('YYYY-MM-DD'));
        current.add(1, 'day');
      }

      const dailyAmount = Math.floor(newAmount / dateList.length);
      const leftover = newAmount - dailyAmount * dateList.length;

      db.transaction(
        tx => {
          dateList.forEach((date, index) => {
            const amount = index === 0 ? dailyAmount + leftover : dailyAmount;

            // 먼저 존재 여부 체크 후 업데이트 또는 삽입
            tx.executeSql(
              `SELECT COUNT(*) as cnt FROM tb_sales_target_history WHERE sales_date = ? AND status_cd = 'STTCD001'`,
              [date],
              (_, result) => {
                const count = result.rows.item(0).cnt;

                if (count > 0) {
                  // 존재하면 업데이트
                  tx.executeSql(
                    `UPDATE tb_sales_target_history SET sales_amount = ? WHERE sales_date = ? AND status_cd = 'STTCD001'`,
                    [amount, date],
                  );
                } else {
                  // 없으면 삽입
                  tx.executeSql(
                    `INSERT INTO tb_sales_target_history (sales_date, sales_amount, status_cd) VALUES (?, ?, 'STTCD001')`,
                    [date, amount],
                  );
                }
              },
            );
          });
        },
        err => {
          reject(err);
        },
        () => {
          resolve('수정 완료');
        },
      );
    } catch (err) {
      reject(err);
    }
  });
};

// 기간 별 매출 합계 반환 함수
export const getSalesAmountSumFromHistory = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT SUM(sales_amount) AS total_amount 
         FROM tb_sales_target_history 
         WHERE sales_date >= ? AND sales_date <= ? 
           AND status_cd = 'STTCD001'`,
        [startDate, endDate],
        (_, result) => {
          const total = result.rows.item(0).total_amount;
          resolve(total !== null ? total : 0); // null인 경우 0으로 반환
        },
        (_, error) => {
          console.log('매출 합계 조회 실패', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// 목표 삭제 (tb_sales_target 테이블)
export const removeSalesTarget = salesTargetId => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE tb_sales_target SET status_cd = 'STTCD002' WHERE sales_target_id = ?`,
        [salesTargetId],
        (_, result) => {
          resolve(`${result.rowsAffected}건 삭제됨`);
        },
        (_, error) => {
          console.log('목표 삭제 실패', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// 목표금액 수정 (tb_sales_target 테이블)
export const updateTargetAmount = (salesTargetId, newAmount) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE tb_sales_target SET target_amount = ? WHERE sales_target_id = ?`,
        [newAmount, salesTargetId],
        (_, result) => {
          resolve(`${result.rowsAffected}건 수정됨`);
        },
        (_, error) => {
          console.log('목표금액 수정 실패', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// 설정한 모든 매출목표 가져오기.
export const getAllValidSalesTargets = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const query = `
        SELECT sales_date, sales_amount 
        FROM tb_sales_target_history 
        WHERE status_cd = 'STTCD001' 
        ORDER BY sales_date DESC
      `;

      tx.executeSql(
        query,
        [],
        (_, result) => {
          const rows = result.rows;
          const data = [];

          for (let i = 0; i < rows.length; i++) {
            data.push(rows.item(i));
          }

          resolve(data);
        },
        (_, error) => {
          console.error('조회 실패:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};
