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

// --- 全局中间件 ---
app.use(cors());
app.use(express.json());

let db;

// --- 数据库初始化 (只执行一次) ---
(async () => {
    try {
        db = await open({ filename: './database.db', driver: sqlite3.Database });
        console.log('✅ Database connected.');

        // 1. 用户表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                love_start_date TEXT DEFAULT '2020-01-26'
            )
        `);
        
        // 2. 日记表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS diaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);

        // 3. 打心记录表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS likes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                diary_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                FOREIGN KEY (diary_id) REFERENCES diaries (id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                UNIQUE (diary_id, user_id)
            )
        `);
        
        // !!新增: 4. 每日一抽记录表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS gacha_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                prize_name TEXT NOT NULL,
                drawn_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `);

        console.log('✅ All tables are ready.');
    } catch (error) {
        console.error('❌ Failed to initialize the database', error);
    }
})();

// --- Token 验证中间件 ---
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


// ===================================
//         API 路由定义
// ===================================


// --- 用户认证 API ---

// 注册
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: '用户名和密码不能为空' });
    try {
        const existingUser = await db.get('SELECT * FROM users WHERE username = ?', username);
        if (existingUser) return res.status(409).json({ message: '用户名已存在' });
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
    if (!username || !password) return res.status(400).json({ message: '用户名和密码不能为空' });
    try {
        const user = await db.get('SELECT * FROM users WHERE username = ?', username);
        if (!user) return res.status(401).json({ message: '用户名或密码错误' });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: '用户名或密码错误' });
        const token = jwt.sign({ id: user.id, username: user.username, love_start_date: user.love_start_date }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: '登录成功', token, user: { id: user.id, username: user.username, love_start_date: user.love_start_date } });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});

// 获取当前登录用户信息
app.get('/api/me', verifyToken, (req, res) => {
    res.json({
        id: req.user.id,
        username: req.user.username,
        love_start_date: req.user.love_start_date,
    });
});


// --- 日记本 API ---

// 获取所有日记
app.get('/api/diaries', verifyToken, async (req, res) => {
    const currentUserId = req.user.id;
    const query = `
        SELECT
            d.id, d.content, d.created_at, d.user_id,
            u.username,
            (SELECT SUM(rating) FROM likes WHERE diary_id = d.id) AS total_hearts,
            (SELECT rating FROM likes WHERE diary_id = d.id AND user_id = ?) AS my_rating
        FROM diaries d
        JOIN users u ON d.user_id = u.id
        ORDER BY d.created_at DESC;
    `;
    try {
        const diaries = await db.all(query, [currentUserId]);
        res.json(diaries);
    } catch (error) {
        res.status(500).json({ message: '获取日记失败', error: error.message });
    }
});

// 发布新日记
app.post('/api/diaries', verifyToken, async (req, res) => {
    const { content } = req.body;
    if (!content || content.trim() === '') return res.status(400).json({ message: '日记内容不能为空' });
    try {
        const result = await db.run('INSERT INTO diaries (content, user_id) VALUES (?, ?)', [content, req.user.id]);
        res.status(201).json({ message: '发布成功', diaryId: result.lastID });
    } catch (error) {
        res.status(500).json({ message: '发布失败', error: error.message });
    }
});

// 给日记打心
app.post('/api/diaries/:id/like', verifyToken, async (req, res) => {
    const diaryId = req.params.id;
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: '评级必须在1-5之间' });
    try {
        const diary = await db.get('SELECT user_id FROM diaries WHERE id = ?', diaryId);
        if (!diary) return res.status(404).json({ message: '日记不存在' });
        if (diary.user_id === req.user.id) return res.status(403).json({ message: '不能给自己的日记打心' });
        await db.run('INSERT OR REPLACE INTO likes (diary_id, user_id, rating) VALUES (?, ?, ?)', [diaryId, req.user.id, rating]);
        res.status(200).json({ message: '操作成功' });
    } catch (error) {
        res.status(500).json({ message: '操作失败', error: error.message });
    }
});


// !!新增: 每日一抽 API ---

// 奖品池
const PRIZE_POOL = [
    "一个甜甜的早安吻",
    "一张“听你的”券",
    "一张“免做家务”卡",
    "下次约会你来定地点",
    "亲手制作的小甜点一份",
    "一个大大的拥抱",
    "今晚陪你看一部电影",
    "承包你一天的奶茶",
    "说十句情话给你听",
    "谢谢参与，明天再来~"
];

// 检查今天是否能抽奖
app.get('/api/gacha/status', verifyToken, async (req, res) => {
    try {
        // 使用 DATE() 函数只比较日期，'localtime' 修正时区
        const lastDraw = await db.get(
            "SELECT 1 FROM gacha_history WHERE user_id = ? AND DATE(drawn_at, 'localtime') = DATE('now', 'localtime')",
            [req.user.id]
        );
        res.json({ canDraw: !lastDraw });
    } catch (error) {
        res.status(500).json({ message: '查询抽奖状态失败', error: error.message });
    }
});

// 执行抽奖
app.post('/api/gacha/draw', verifyToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const lastDraw = await db.get(
            "SELECT 1 FROM gacha_history WHERE user_id = ? AND DATE(drawn_at, 'localtime') = DATE('now', 'localtime')",
            [userId]
        );
        if (lastDraw) {
            return res.status(403).json({ message: '您今天已经抽过奖了，明天再来吧！' });
        }

        const prize = PRIZE_POOL[Math.floor(Math.random() * PRIZE_POOL.length)];
        await db.run(
            'INSERT INTO gacha_history (user_id, prize_name) VALUES (?, ?)',
            [userId, prize]
        );
        res.status(201).json({ message: '恭喜！', prize });

    } catch (error) {
        res.status(500).json({ message: '抽奖失败', error: error.message });
    }
});

// 获取抽奖历史
app.get('/api/gacha/history', verifyToken, async (req, res) => {
    try {
        const history = await db.all(
            'SELECT prize_name, drawn_at FROM gacha_history WHERE user_id = ? ORDER BY drawn_at DESC',
            [req.user.id]
        );
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: '获取历史记录失败', error: error.message });
    }
});


// --- 启动服务器 ---
app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
});