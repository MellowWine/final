// backend/index.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-super-secret-key-change-it';

app.use(cors());
app.use(express.json());

let db;

(async () => {
    try {
        db = await open({
            filename: './database.db',
            driver: sqlite3.Database
        });
        console.log('✅ Database connected.');

        await db.exec(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT 0
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                /* !!修改点: 将这里的默认日期改为您指定的日期 */
                love_start_date TEXT DEFAULT '2020-01-26' 
            )
        `);
        console.log('✅ Tables are ready.');
    } catch (error) {
        console.error('❌ Failed to initialize the database', error);
    }
})();


// --- 用户认证 API (保持不变) ---
// ... (注册, 登录, verifyToken, /api/me 路由都保持原样) ...

// 注册
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
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run('INSERT INTO users (username, password) VALUES (?, ?)', username, hashedPassword);
        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});

// 登录
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
        const token = jwt.sign(
            { id: user.id, username: user.username, love_start_date: user.love_start_date },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                love_start_date: user.love_start_date
            }
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});

// 中间件，用于验证 Token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// “获取我的信息”的 API 路由
app.get('/api/me', verifyToken, (req, res) => {
    res.json({
        id: req.user.id,
        username: req.user.username,
        love_start_date: req.user.love_start_date,
    });
});


// 启动服务器
app.listen(PORT, () => {
    console.log(`✅ Backend server is running at http://localhost:${PORT}`);
});