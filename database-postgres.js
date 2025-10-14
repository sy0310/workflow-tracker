const { Pool } = require('pg');

// 从环境变量获取数据库连接配置
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL 未配置，将使用 SQLite 数据库');
}

// 创建 PostgreSQL 连接池
const pool = DATABASE_URL ? new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
}) : null;

/**
 * 执行查询并返回多行结果
 */
async function query(sql, params = []) {
    if (!pool) {
        throw new Error('PostgreSQL 连接池未初始化');
    }
    
    try {
        const result = await pool.query(sql, params);
        return result.rows;
    } catch (error) {
        console.error('❌ PostgreSQL 查询错误:', error);
        console.error('SQL:', sql);
        console.error('参数:', params);
        throw error;
    }
}

/**
 * 执行查询并返回单行结果
 */
async function get(sql, params = []) {
    if (!pool) {
        throw new Error('PostgreSQL 连接池未初始化');
    }
    
    try {
        const result = await pool.query(sql, params);
        return result.rows[0] || null;
    } catch (error) {
        console.error('❌ PostgreSQL 查询错误:', error);
        console.error('SQL:', sql);
        console.error('参数:', params);
        throw error;
    }
}

/**
 * 执行插入/更新/删除操作
 */
async function run(sql, params = []) {
    if (!pool) {
        throw new Error('PostgreSQL 连接池未初始化');
    }
    
    try {
        const result = await pool.query(sql, params);
        return {
            id: result.rows[0] ? result.rows[0].id : null,
            changes: result.rowCount
        };
    } catch (error) {
        console.error('❌ PostgreSQL 执行错误:', error);
        console.error('SQL:', sql);
        console.error('参数:', params);
        throw error;
    }
}

/**
 * 关闭连接池
 */
async function close() {
    if (pool) {
        await pool.end();
    }
}

/**
 * 测试数据库连接
 */
async function testConnection() {
    if (!pool) {
        console.log('⚠️  PostgreSQL 未配置');
        return false;
    }
    
    try {
        await pool.query('SELECT 1');
        console.log('✅ PostgreSQL 连接成功');
        return true;
    } catch (error) {
        console.error('❌ PostgreSQL 连接失败:', error.message);
        return false;
    }
}

// 在启动时测试连接
if (pool) {
    testConnection().then(success => {
        if (success) {
            console.log('✅ PostgreSQL 数据库连接成功');
        } else {
            console.error('❌ PostgreSQL 数据库连接失败');
        }
    });
} else {
    console.log('⚠️  PostgreSQL 未配置，使用 SQLite 数据库');
}

module.exports = {
    query,
    get,
    run,
    close,
    testConnection,
    pool
};


