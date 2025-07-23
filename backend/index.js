// backend/index.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-super-secret-key-change-it'; // !!重要: 在生产环境中请使用更复杂且安全的密钥

// 中间件
app.use(cors());
app.use(express.json());

let db;

// 数据库初始化
(async () => {
    try {
        db = await open({
            filename: './database.db',
            driver: sqlite3.Database
        });

        // 创建 tasks 表 (如果不存在)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT 0
            )
        `);

        // !!新增: 创建 users 表 (如果不存在)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            )
        `);
        console.log('✅ Database connected and tables are ready.');
    } catch (error) {
        console.error('❌ Failed to connect to the database', error);
    }
})();

// --- 任务 API (保留) ---
app.get('/api/tasks', async (req, res) => {
    const tasks = await db.all('SELECT * FROM tasks ORDER BY id DESC');
    res.json(tasks);
});
app.post('/api/tasks', async (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const result = await db.run('INSERT INTO tasks (title) VALUES (?)', title);
    const newTask = await db.get('SELECT * FROM tasks WHERE id = ?', result.lastID);
    res.status(201).json(newTask);
});

// --- !!新增: 用户认证 API ---

// 注册接口
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    try {
        const existingUser = await db.get('SELECT * FROM users WHERE username = ?', username);
        if (existingUser) {
            return res.status(409).json({ message: '用户名已存在' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // 加密密码
        await db.run('INSERT INTO users (username, password) VALUES (?, ?)', username, hashedPassword);

        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});

// 登录接口
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    try {
        const user = await db.get('SELECT * FROM users WHERE username = ?', username);
        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 密码验证成功，生成JWT
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' } // 令牌有效期1小时
        );

        res.json({
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});


// 启动服务器
app.listen(PORT, () => {
    console.log(`✅ Backend server is running at http://localhost:${PORT}`);
});