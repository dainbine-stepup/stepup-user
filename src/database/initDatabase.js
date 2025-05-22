import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'stepup.db',
    location: 'default',
  },
  () => {
    console.log('Database opened');
  },
  error => {
    console.log(error);
  },
);

// 테이블 생성
export const initDatabase = () => {
  db.transaction(tx => {
    // 목표 테이블
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS tb_sales_target (
          sales_target_id INTEGER PRIMARY KEY AUTOINCREMENT,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          target_amount INTEGER NOT NULL,
          type_cd TEXT NOT NULL,
          status_cd TEXT NOT NULL,
          reg_dt TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
          mod_dt TEXT DEFAULT NULL
        )`,
      [],
      () => {
        console.log('tb_sales_target 테이블 생성 완료');
      },
      (tx, error) => {
        console.log(error);
      },
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS tb_sales_target_history (
      sales_target_history_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sales_date TEXT NOT NULL,
      sales_amount INTEGER NOT NULL,
      status_cd TEXT NOT NULL,
      reg_dt TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      mod_dt TEXT DEFAULT NULL
    )`,
      [],
      () => {
        console.log('tb_sales_target_history 테이블 생성 완료');
      },
      (tx, error) => {
        console.log(error);
      },
    );

    // 매출 테이블
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS tb_sales_record (
          sales_record_id INTEGER PRIMARY KEY AUTOINCREMENT,
          sales_date TEXT NOT NULL,
          sales_amount INTEGER NOT NULL,
          status_cd TEXT NOT NULL,
          reg_dt TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
          mod_dt TEXT DEFAULT NULL
        )`,
      [],
      () => {
        console.log('tb_sales_record 테이블 생성 완료');
      },
      (tx, error) => {
        console.log(error);
      },
    );

    // 코드 테이블
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS tb_code (
          code_id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL,
          code_name TEXT NOT NULL,
          reg_dt TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
          mod_dt TEXT DEFAULT NULL
        )`,
      [],
      () => {
        console.log('tb_code 테이블 생성 완료');
      },
      (tx, error) => {
        console.log(error);
      },
    );

    // 코드 데이터가 없는 경우만 추가
    tx.executeSql(
      `SELECT COUNT(*) as cnt FROM tb_code`,
      [],
      (tx, results) => {
        const count = results.rows.item(0).cnt;

        if (count === 0) {
          console.log('코드 데이터 없음 → 데이터 추가 시작');

          const codes = [
            ['STTCD001', '활성화'],
            ['STTCD002', '비활성화'],
            ['TYPCD001', '월'],
            ['TYPCD002', '주'],
          ];

          codes.forEach(([code, code_name]) => {
            tx.executeSql(
              `INSERT INTO tb_code (code, code_name) VALUES (?, ?)`,
              [code, code_name],
              () => {
                console.log(`코드 ${code} 추가 완료`);
              },
              (tx, error) => {
                console.log(error);
              },
            );
          });
        } else {
          console.log('코드 데이터 이미 있음 → 추가 안함');
        }
      },
      (tx, error) => {
        console.log(error);
      },
    );

    // 코드 테이블 전체 조회
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM tb_code`,
        [],
        (tx, results) => {
          const rows = results.rows;

          console.log('=== 코드 테이블 데이터 ===');
          for (let i = 0; i < rows.length; i++) {
            const item = rows.item(i);
            console.log(
              `코드 ID: ${item.code_id}, 코드: ${item.code}, 코드명: ${item.code_name}`,
            );
          }
        },
        (tx, error) => {
          console.log('코드 데이터 조회 에러:', error);
        },
      );
    });
  });
};

export default db;
