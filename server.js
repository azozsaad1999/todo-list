// ================================
// الباك اند — server.js
// مرتبط بقاعدة بيانات MongoDB Atlas
// ================================

const http       = require('http');
const { MongoClient, ObjectId } = require('mongodb');

const PORT        = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI; // من متغير البيئة في Render

let db; // سنحفظ الاتصال هنا

// ================================
// الاتصال بقاعدة البيانات
// ================================
async function connectDB() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db('todo-app');         // اسم قاعدة البيانات
  console.log('✅ متصل بـ MongoDB');
}

// ================================
// إنشاء السيرفر
// ================================
const server = http.createServer(async (req, res) => {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const tasks = db.collection('tasks'); // "جدول" المهام في MongoDB

  // ======================
  // GET /tasks — جلب كل المهام
  // ======================
  if (req.method === 'GET' && req.url === '/tasks') {
    const allTasks = await tasks.find().toArray();
    res.writeHead(200);
    res.end(JSON.stringify(allTasks));

  // ======================
  // POST /tasks — إضافة مهمة
  // ======================
  } else if (req.method === 'POST' && req.url === '/tasks') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const { text } = JSON.parse(body);
      const newTask  = { text, done: false, createdAt: new Date() };
      const result   = await tasks.insertOne(newTask);
      res.writeHead(201);
      res.end(JSON.stringify({ ...newTask, _id: result.insertedId }));
    });

  // ======================
  // PUT /tasks/:id — تأشير مكتملة
  // ======================
  } else if (req.method === 'PUT' && req.url.startsWith('/tasks/')) {
    const id   = req.url.split('/')[2];
    const task = await tasks.findOne({ _id: new ObjectId(id) });
    if (!task) { res.writeHead(404); res.end(JSON.stringify({ error: 'غير موجودة' })); return; }
    await tasks.updateOne({ _id: new ObjectId(id) }, { $set: { done: !task.done } });
    res.writeHead(200);
    res.end(JSON.stringify({ ...task, done: !task.done }));

  // ======================
  // DELETE /tasks/:id — حذف مهمة
  // ======================
  } else if (req.method === 'DELETE' && req.url.startsWith('/tasks/')) {
    const id = req.url.split('/')[2];
    await tasks.deleteOne({ _id: new ObjectId(id) });
    res.writeHead(200);
    res.end(JSON.stringify({ success: true }));

  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'المسار غير موجود' }));
  }

});

// ================================
// ابدأ السيرفر بعد الاتصال بـ MongoDB
// ================================
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ السيرفر يشتغل على: http://localhost:${PORT}`);
  });
});