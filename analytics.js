const express = require('express');
const Database = require('better-sqlite3');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// Configure S3 from Bucketeer environment variables
const s3 = new AWS.S3({
    accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
    region: process.env.BUCKETEER_AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.BUCKETEER_BUCKET_NAME;
const DB_BACKUP_KEY = 'sayless-analytics.db';
const LOCAL_DB_PATH = './analytics.db';

// Initialize database
let db;

async function initDatabase() {
    // Try to restore from S3 first
    if (BUCKET_NAME) {
        try {
            console.log('Attempting to restore database from S3...');
            const data = await s3.getObject({
                Bucket: BUCKET_NAME,
                Key: DB_BACKUP_KEY
            }).promise();
            
            await fs.writeFile(LOCAL_DB_PATH, data.Body);
            console.log('Database restored from S3');
        } catch (err) {
            if (err.code === 'NoSuchKey') {
                console.log('No backup found in S3, starting fresh');
            } else {
                console.error('Error restoring from S3:', err);
            }
        }
    }
    
    // Open database (will create if doesn't exist)
    db = new Database(LOCAL_DB_PATH, { verbose: console.log });
    
    // Create schema if it doesn't exist
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hits'").get();
    if (!tableExists) {
        console.log('Creating database schema...');
        db.exec(`
            CREATE TABLE hits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                path TEXT NOT NULL,
                referrer TEXT,
                ip_hash TEXT,
                user_agent TEXT,
                screen_size TEXT
            );
            
            CREATE INDEX idx_timestamp ON hits(timestamp);
            CREATE INDEX idx_path ON hits(path);
            CREATE INDEX idx_referrer ON hits(referrer);
        `);
    }
}

// Backup database to S3
async function backupToS3() {
    if (!BUCKET_NAME) return;
    
    try {
        console.log('Backing up database to S3...');
        const data = await fs.readFile(LOCAL_DB_PATH);
        
        await s3.putObject({
            Bucket: BUCKET_NAME,
            Key: DB_BACKUP_KEY,
            Body: data,
            ContentType: 'application/x-sqlite3'
        }).promise();
        
        console.log('Database backed up to S3');
    } catch (err) {
        console.error('Error backing up to S3:', err);
    }
}

// Helper to hash IPs for privacy
function hashIP(ip) {
    return crypto.createHash('sha256').update(ip + new Date().toISOString().split('T')[0]).digest('hex').substring(0, 16);
}

// Collect hits
app.post('/hit', (req, res) => {
    const { p: path, r: referrer, s: screenSize } = req.body;
    const ipHash = hashIP(req.ip);
    const userAgent = req.get('user-agent') || '';
    
    const stmt = db.prepare(`
        INSERT INTO hits (path, referrer, ip_hash, user_agent, screen_size)
        VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(
        path || '/',
        referrer || 'direct',
        ipHash,
        userAgent,
        screenSize || 'unknown'
    );
    
    res.sendStatus(204);
});

// Get stats
app.get('/api/stats', (req, res) => {
    const range = req.query.range || 'today';
    
    let timeFilter = "datetime('now', 'localtime', 'start of day')";
    if (range === 'week') timeFilter = "datetime('now', 'localtime', '-7 days')";
    if (range === 'month') timeFilter = "datetime('now', 'localtime', '-30 days')";
    
    // Total pageviews
    const total = db.prepare(`
        SELECT COUNT(*) as count FROM hits 
        WHERE timestamp >= ${timeFilter}
    `).get();
    
    // Unique visitors (by IP hash)
    const unique = db.prepare(`
        SELECT COUNT(DISTINCT ip_hash) as count FROM hits 
        WHERE timestamp >= ${timeFilter}
    `).get();
    
    // Bounce rate (visitors who only viewed one page)
    const bounces = db.prepare(`
        SELECT COUNT(*) as count FROM (
            SELECT ip_hash FROM hits 
            WHERE timestamp >= ${timeFilter}
            GROUP BY ip_hash 
            HAVING COUNT(DISTINCT path) = 1
        )
    `).get();
    
    // Top pages
    const pages = db.prepare(`
        SELECT path as name, COUNT(*) as count 
        FROM hits 
        WHERE timestamp >= ${timeFilter}
        GROUP BY path 
        ORDER BY count DESC 
        LIMIT 20
    `).all();
    
    // Top referrers
    const referrers = db.prepare(`
        SELECT referrer as name, COUNT(*) as count 
        FROM hits 
        WHERE timestamp >= ${timeFilter}
        GROUP BY referrer 
        ORDER BY count DESC 
        LIMIT 20
    `).all();
    
    // Device types (basic detection from user agent)
    const devices = db.prepare(`
        SELECT 
            CASE 
                WHEN user_agent LIKE '%Mobile%' OR user_agent LIKE '%Android%' OR user_agent LIKE '%iPhone%' THEN 'Mobile'
                WHEN user_agent LIKE '%Tablet%' OR user_agent LIKE '%iPad%' THEN 'Tablet'
                ELSE 'Desktop'
            END as name,
            COUNT(*) as count
        FROM hits 
        WHERE timestamp >= ${timeFilter}
        GROUP BY name
        ORDER BY count DESC
    `).all();
    
    res.json({
        total: total.count,
        unique: unique.count,
        bounces: bounces.count,
        pages,
        referrers,
        devices
    });
});

// Periodic tasks
setInterval(async () => {
    // Clean old data (keep last 90 days)
    db.prepare(`
        DELETE FROM hits 
        WHERE timestamp < datetime('now', '-90 days')
    `).run();
    
    // Backup to S3
    await backupToS3();
}, 60 * 60 * 1000); // Every hour

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, backing up and shutting down...');
    await backupToS3();
    db.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, backing up and shutting down...');
    await backupToS3();
    db.close();
    process.exit(0);
});

// Start server
async function start() {
    await initDatabase();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Analytics server running on port ${PORT}`);
        
        // Do an initial backup after 5 minutes
        setTimeout(backupToS3, 5 * 60 * 1000);
    });
}

start().catch(console.error);