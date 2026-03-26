import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'employee_onboarding',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

export type RowDataPacket = mysql.RowDataPacket;
export type ResultSetHeader = mysql.ResultSetHeader;

export async function query<T extends Record<string, any> = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(sql, params || []);
    return rows as T[];
  } finally {
    connection.release();
  }
}

export async function queryOne<T extends Record<string, any> = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

export async function execute(sql: string, params?: any[]) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(sql, params || []);
    return result as ResultSetHeader;
  } finally {
    connection.release();
  }
}

export default pool;
