// backend/index.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const cors = require('cors');

const app = express();
const PORT = 3001; // 定义后端端口

// 中间件
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析JSON请求体

let db;

// 异步函数：连接数据库并初始化表
(async () => {
    try {
        db = await open({
            filename: './database.db', // 数据库文件将创建在 backend 文件夹内
            driver: sqlite3.Database
        });

        // 如果 'tasks' 表不存在，则创建它
        await db.exec(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT 0
            )
        `);
        console.log('✅ Database connected and table is ready.');
    } catch (error) {
        console.error('❌ Failed to connect to the database', error);
    }
})();

// --- API 路由 ---

// GET /api/tasks: 获取所有任务
app.get('/api/tasks', async (req, res) => {
    const tasks = await db.all('SELECT * FROM tasks ORDER BY id DESC');
    res.json(tasks);
});

// POST /api/tasks: 创建新任务
app.post('/api/tasks', async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    const result = await db.run('INSERT INTO tasks (title) VALUES (?)', title);
    const newTask = await db.get('SELECT * FROM tasks WHERE id = ?', result.lastID);
    res.status(201).json(newTask);
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`✅ Backend server is running at http://localhost:${PORT}`);
});