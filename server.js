// ================================
// الباك اند — server.js
// مبني على Node.js بدون أي مكتبات خارجية
// ================================

const http = require('http');   // مكتبة Node.js لإنشاء سيرفر
const fs   = require('fs');     // مكتبة Node.js للتعامل مع الملفات
const path = require('path');   // مكتبة Node.js للتعامل مع مسارات الملفات

const PORT      = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json'); // ملف JSON = "قاعدة البيانات"

// --- إنشاء ملف البيانات لو ما يوجد ---
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// --- دوال قراءة وحفظ المهام ---
function readTasks() {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// ================================
// إنشاء السيرفر
// ================================
const server = http.createServer((req, res) => {

  // السماح للفرونت اند بالتكلم مع الباك اند (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ======================
  // GET /tasks — جلب كل المهام
  // ======================
  if (req.method === 'GET' && req.url === '/tasks') {
    const tasks = readTasks();
    res.writeHead(200);
    res.end(JSON.stringify(tasks));

  // ======================
  // POST /tasks — إضافة مهمة جديدة
  // ======================
  } else if (req.method === 'POST' && req.url === '/tasks') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { text } = JSON.parse(body);
      const tasks = readTasks();
      const newTask = { id: Date.now(), text, done: false };
      tasks.push(newTask);
      writeTasks(tasks);
      res.writeHead(201);
      res.end(JSON.stringify(newTask));
    });

  // ======================
  // PUT /tasks/:id — تعديل مهمة (تأشير مكتملة)
  // ======================
  } else if (req.method === 'PUT' && req.url.startsWith('/tasks/')) {
    const id = parseInt(req.url.split('/')[2]);
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const tasks = readTasks();
      const task  = tasks.find(t => t.id === id);
      if (!task) { res.writeHead(404); res.end(JSON.stringify({ error: 'مهمة غير موجودة' })); return; }
      task.done = !task.done;
      writeTasks(tasks);
      res.writeHead(200);
      res.end(JSON.stringify(task));
    });

  // ======================
  // DELETE /tasks/:id — حذف مهمة
  // ======================
  } else if (req.method === 'DELETE' && req.url.startsWith('/tasks/')) {
    const id    = parseInt(req.url.split('/')[2]);
    let tasks   = readTasks();
    tasks       = tasks.filter(t => t.id !== id);
    writeTasks(tasks);
    res.writeHead(200);
    res.end(JSON.stringify({ success: true }));

  // ======================
  // أي طلب ثاني = 404
  // ======================
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'المسار غير موجود' }));
  }

});

server.listen(PORT, () => {
  console.log(`✅ السيرفر يشتغل على: http://localhost:${PORT}`);
});