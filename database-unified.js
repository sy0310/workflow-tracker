const supabase = require('./config/supabase');

/**
 * 统一的数据库查询接口
 * 将所有数据库操作统一到Supabase
 */

/**
 * 执行查询并返回多行结果
 */
async function query(tableName, options = {}) {
    try {
        let query = supabase
            .from(tableName)
            .select(options.select || '*');
        
        // 添加where条件
        if (options.where) {
            Object.keys(options.where).forEach(key => {
                query = query.eq(key, options.where[key]);
            });
        }
        
        // 添加排序
        if (options.order) {
            query = query.order(options.order, { ascending: true });
        }
        
        // 添加限制
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        const { data, error } = await query;
        
        if (error) {
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error('❌ Supabase查询错误:', error);
        throw error;
    }
}

/**
 * 执行查询并返回单行结果
 */
async function get(tableName, options = {}) {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select(options.select || '*')
            .eq(options.where || {})
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return null; // 没有找到记录
            }
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error('❌ Supabase查询错误:', error);
        throw error;
    }
}

/**
 * 执行插入操作
 */
async function insert(tableName, data) {
    try {
        const { data: result, error } = await supabase
            .from(tableName)
            .insert(data)
            .select();
        
        if (error) {
            throw error;
        }
        
        return result[0];
    } catch (error) {
        console.error('❌ Supabase插入错误:', error);
        throw error;
    }
}

/**
 * 执行更新操作
 */
async function update(tableName, data, where) {
    try {
        let query = supabase
            .from(tableName)
            .update(data);
        
        // 添加where条件
        Object.keys(where).forEach(key => {
            query = query.eq(key, where[key]);
        });
        
        const { data: result, error } = await query.select();
        
        if (error) {
            throw error;
        }
        
        return result[0];
    } catch (error) {
        console.error('❌ Supabase更新错误:', error);
        throw error;
    }
}

/**
 * 执行删除操作
 */
async function remove(tableName, where) {
    try {
        let query = supabase
            .from(tableName)
            .delete();
        
        // 添加where条件
        Object.keys(where).forEach(key => {
            query = query.eq(key, where[key]);
        });
        
        const { error } = await query;
        
        if (error) {
            throw error;
        }
        
        return true;
    } catch (error) {
        console.error('❌ Supabase删除错误:', error);
        throw error;
    }
}

/**
 * 兼容旧接口的方法
 */
async function run(sql, params = []) {
    // 这个方法主要用于兼容，实际应该使用具体的CRUD方法
    console.warn('⚠️  使用了兼容方法run()，建议使用具体的CRUD方法');
    return { id: null, changes: 0 };
}

module.exports = {
    query,
    get,
    insert,
    update,
    remove,
    run,
    supabase // 直接暴露supabase客户端
};