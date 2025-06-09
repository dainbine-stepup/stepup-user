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
    
    // 매출 관리 테이블 (date 2025-05 형식)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS tb_sales (
          sales_id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          target INTEGER NOT NULL,
          amount INTEGER NOT NULL
        )`,
      [],
      () => {
        console.log('tb_sales 테이블 생성 완료');
      },
      (tx, error) => {
        console.log('테이블 생성 오류', error);
      },
    );

  });
};

export default db;
