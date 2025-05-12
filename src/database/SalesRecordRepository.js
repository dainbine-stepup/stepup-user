import {openDatabase} from 'react-native-sqlite-storage';

const db = openDatabase({name: 'stepup.db'});

const SalesRecordRepository = {
  insertSalesRecord: (params, successCallback, errorCallback) => {
    const {insertSalesDate, insertSalesAmount, insertPeriodType} = params;
    const statusCd = 'STTCD001';

    // 월 매출 저장
    if (insertPeriodType === 'month') {
      // 입력 받은 날짜 값
      const [yearStr, monthStr] = insertSalesDate.split('-');
      const year = parseInt(yearStr); // ex) 2025
      const month = parseInt(monthStr) - 1; // ex) 05

      // 해당 월의 시작, 마지막 날 계산
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      const daysInMonth = endDate.getDate();

      // 월 매출을 일정하게 나눈 값과 보정 값
      const perDayAmount = Math.floor(insertSalesAmount / daysInMonth);
      const adjustment = insertSalesAmount - perDayAmount * daysInMonth; // 보정값

      const now = new Date();
      const modDt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(now.getDate()).padStart(2, '0')} ${String(
        now.getHours(),
      ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
        now.getSeconds(),
      ).padStart(2, '0')}`;

      const dates = [];
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
      }

      db.transaction(
        tx => {
          dates.forEach((date, index) => {
            const amount =
              index === 0 ? perDayAmount + adjustment : perDayAmount;
            // 먼저 UPDATE 시도
            tx.executeSql(
              `UPDATE tb_sales_record SET sales_amount = ?, mod_dt = ? WHERE sales_date = ? AND status_cd = ?`,
              [amount, modDt, date, statusCd],
              (_, result) => {
                if (result.rowsAffected === 0) {
                  // 없으면 INSERT
                  tx.executeSql(
                    `INSERT INTO tb_sales_record (sales_date, sales_amount, status_cd) VALUES (?, ?, ?)`,
                    [date, amount, statusCd],
                  );
                }
              },
            );
          });
        },
        (tx, error) => {
          if (errorCallback) errorCallback(error);
        },
        () => {
          if (successCallback) successCallback();
        },
      );
    }

    //  주 매출 저장
    else if (insertPeriodType === 'week') {
      // 입력 받은 날짜 값
      const [startStr, endStr] = insertSalesDate.split(' ~ '); // ex) '2025-05-06 ~ 2025-05-12'

      const startDate = new Date(startStr);
      const endDate = new Date(endStr);

      const days = [];
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        days.push(`${yyyy}-${mm}-${dd}`);
      }

      const perDayAmount = Math.floor(insertSalesAmount / days.length);
      const adjustment = insertSalesAmount - perDayAmount * days.length;

      const now = new Date();
      const modDt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(now.getDate()).padStart(2, '0')} ${String(
        now.getHours(),
      ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
        now.getSeconds(),
      ).padStart(2, '0')}`;

      db.transaction(
        tx => {
          days.forEach((date, index) => {
            const amount =
              index === 0 ? perDayAmount + adjustment : perDayAmount;

            tx.executeSql(
              `UPDATE tb_sales_record SET sales_amount = ?, mod_dt = ? WHERE sales_date = ? AND status_cd = ?`,
              [amount, modDt, date, statusCd],
              (_, result) => {
                if (result.rowsAffected === 0) {
                  tx.executeSql(
                    `INSERT INTO tb_sales_record (sales_date, sales_amount, status_cd) VALUES (?, ?, ?)`,
                    [date, amount, statusCd],
                  );
                }
              },
            );
          });
        },
        (tx, error) => {
          if (errorCallback) errorCallback(error);
        },
        () => {
          if (successCallback) successCallback();
        },
      );
    }

    // 일 매출 저장
    else if (insertPeriodType === 'day') {
      const date = insertSalesDate;
      const amount = insertSalesAmount;

      const now = new Date();
      const modDt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(now.getDate()).padStart(2, '0')} ${String(
        now.getHours(),
      ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
        now.getSeconds(),
      ).padStart(2, '0')}`;

      db.transaction(
        tx => {
          tx.executeSql(
            `UPDATE tb_sales_record SET sales_amount = ?, mod_dt = ? WHERE sales_date = ? AND status_cd = ?`,
            [amount, modDt, date, statusCd],
            (_, result) => {
              if (result.rowsAffected === 0) {
                tx.executeSql(
                  `INSERT INTO tb_sales_record (sales_date, sales_amount, status_cd) VALUES (?, ?, ?)`,
                  [date, amount, statusCd],
                );
              }
            },
          );
        },
        (tx, error) => {
          if (errorCallback) errorCallback(error);
        },
        () => {
          if (successCallback) successCallback();
        },
      );
    }
  },

  // 조회
  getSalesRecord: (recordPeriodType, successCallback, errorCallback) => {
    const statusCd = 'STTCD001';

    // 월별 합계 매출 조회
    if (recordPeriodType === 'month') {
      const query = `
                SELECT SUBSTR(sales_date, 1, 7) AS sales_date, SUM(sales_amount) AS sales_amount
                FROM tb_sales_record
                WHERE status_cd = ?
                GROUP BY SUBSTR(sales_date, 1, 7)
                ORDER BY SUBSTR(sales_date, 1, 7) DESC
            `;
      db.transaction(tx => {
        tx.executeSql(
          query,
          [statusCd],
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
          },
        );
      });
    }

    // 주간 합계 매출 조회
    else if (recordPeriodType === 'week') {
      const query = `
                SELECT 
                    date(sales_date, '-' || ((strftime('%w', sales_date) + 6) % 7) || ' days') || ' ~ ' || 
                    date(sales_date, '+' || (6 - ((strftime('%w', sales_date) + 6) % 7)) || ' days') AS sales_date,
                    SUM(sales_amount) AS sales_amount
                FROM tb_sales_record
                WHERE status_cd = ?
                GROUP BY strftime('%Y-%W', sales_date)
                ORDER BY sales_date DESC

            `;
      db.transaction(tx => {
        tx.executeSql(
          query,
          [statusCd],
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
          },
        );
      });
    }

    // 일별 합계 매출 조회
    else if (recordPeriodType === 'day') {
      const query = `
                SELECT sales_date, sales_amount
                FROM tb_sales_record
                WHERE status_cd = ?
                ORDER BY sales_date DESC
            `;
      db.transaction(tx => {
        tx.executeSql(
          query,
          [statusCd],
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
          },
        );
      });
    }
  },

  // 수정
  updateSalesAmount: (
    recordPeriodType,
    updateAmount,
    dates,
    successCallback,
    errorCallback,
  ) => {
    const now = new Date();
    const modDt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(now.getDate()).padStart(2, '0')} ${String(
      now.getHours(),
    ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
      now.getSeconds(),
    ).padStart(2, '0')}`;

    const statusCd = 'STTCD001';
    const disabledCd = 'STTCD002';

    if (recordPeriodType === 'month') {
      db.transaction(
        tx => {
          dates.forEach(monthStr => {
            const [yearStr, monthStrNum] = monthStr.split('-');
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStrNum, 10) - 1;

            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const days = [];
            for (
              let d = new Date(startDate);
              d <= endDate;
              d.setDate(d.getDate() + 1)
            ) {
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              days.push(`${yyyy}-${mm}-${dd}`);
            }

            const perDayAmount = Math.floor(updateAmount / days.length);
            const adjustment = updateAmount - perDayAmount * days.length;

            // 1. 기존 데이터 비활성화
            tx.executeSql(
              `UPDATE tb_sales_record SET status_cd = ? WHERE sales_date BETWEEN ? AND ? AND status_cd = ?`,
              [disabledCd, days[0], days[days.length - 1], statusCd],
            );

            // 2. 새로운 금액으로 insert
            days.forEach((date, index) => {
              const amount =
                index === 0 ? perDayAmount + adjustment : perDayAmount;
              tx.executeSql(
                `INSERT INTO tb_sales_record (sales_date, sales_amount, status_cd) VALUES (?, ?, ?)`,
                [date, amount, statusCd],
              );
            });
          });
        },
        error => errorCallback?.(error),
        () => successCallback?.(),
      );
    } else if (recordPeriodType === 'week') {
      db.transaction(
        tx => {
          dates.forEach(periodStr => {
            const [startStr, endStr] = periodStr.split(' ~ ');
            const startDate = new Date(startStr);
            const endDate = new Date(endStr);

            const days = [];
            for (
              let d = new Date(startDate);
              d <= endDate;
              d.setDate(d.getDate() + 1)
            ) {
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              days.push(`${yyyy}-${mm}-${dd}`);
            }

            const perDayAmount = Math.floor(updateAmount / days.length);
            const adjustment = updateAmount - perDayAmount * days.length;

            tx.executeSql(
              `UPDATE tb_sales_record SET status_cd = ? WHERE sales_date BETWEEN ? AND ? AND status_cd = ?`,
              [disabledCd, days[0], days[days.length - 1], statusCd],
            );

            days.forEach((date, index) => {
              const amount =
                index === 0 ? perDayAmount + adjustment : perDayAmount;
              tx.executeSql(
                `INSERT INTO tb_sales_record (sales_date, sales_amount, status_cd) VALUES (?, ?, ?)`,
                [date, amount, statusCd],
              );
            });
          });
        },
        error => errorCallback?.(error),
        () => successCallback?.(),
      );
    } else if (recordPeriodType === 'day') {
      db.transaction(
        tx => {
          dates.forEach(date => {
            tx.executeSql(
              `UPDATE tb_sales_record 
                        SET sales_amount = ?, mod_dt = ? 
                        WHERE sales_date = ? AND status_cd = ?`,
              [updateAmount, modDt, date, statusCd],
            );
          });
        },
        error => errorCallback?.(error),
        () => successCallback?.(),
      );
    }
  },

  // 삭제 (비활성화)
  deleteSalesRecords: (
    recordPeriodType,
    dates,
    successCallback,
    errorCallback,
  ) => {
    const disabledCd = 'STTCD002';
    const statusCd = 'STTCD001';

    db.transaction(
      tx => {
        dates.forEach(target => {
          if (recordPeriodType === 'month') {
            const [yearStr, monthStrNum] = target.split('-');
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStrNum, 10) - 1;

            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
            const endStr = `${endDate.getFullYear()}-${String(
              endDate.getMonth() + 1,
            ).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

            tx.executeSql(
              `UPDATE tb_sales_record SET status_cd = ? WHERE sales_date BETWEEN ? AND ? AND status_cd = ?`,
              [disabledCd, startStr, endStr, statusCd],
            );
          } else if (recordPeriodType === 'week') {
            const [startStr, endStr] = target.split(' ~ ');
            tx.executeSql(
              `UPDATE tb_sales_record SET status_cd = ? WHERE sales_date BETWEEN ? AND ? AND status_cd = ?`,
              [disabledCd, startStr, endStr, statusCd],
            );
          } else if (recordPeriodType === 'day') {
            tx.executeSql(
              `UPDATE tb_sales_record SET status_cd = ? WHERE sales_date = ? AND status_cd = ?`,
              [disabledCd, target, statusCd],
            );
          }
        });
      },
      error => errorCallback?.(error),
      () => successCallback?.(),
    );
  },
};

export default SalesRecordRepository;
