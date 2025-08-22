const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');
const server = jsonServer.create();
const dbPath = path.join(__dirname, 'public', 'db.json');

// Check if db.json exists
if (!fs.existsSync(dbPath)) {
  console.error(`Error: db.json not found at ${dbPath}`);
  process.exit(1);
}

// Create router using the db.json file
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

// Add custom routes for accessing quiz data
server.use(middlewares);

// Enhanced logging for database writes
// This helps debug changes to the db.json file
router.db._.mixin({
  write: function() {
    console.log(`[${new Date().toISOString()}] Writing to db.json...`);
    const result = this.__proto__.write.apply(this, arguments);
    console.log(`[${new Date().toISOString()}] Write complete`);
    return result;
  }
});

// Add custom route to get quizzes by subjectId
server.get('/api/quizzes/subject/:id', (req, res) => {
  const db = router.db.getState();
  const subjectId = parseInt(req.params.id);
  
  const quiz = db.quizzes.find(q => parseInt(q.subjectId) === subjectId);
  
  if (quiz) {
    res.json(quiz);
  } else {
    res.status(404).json({ error: "Quiz not found" });
  }
});

// Add debug route to verify db state
server.get('/api/debug/db', (req, res) => {
  const db = router.db.getState();
  res.json({
    collections: Object.keys(db),
    batchSchedulesCount: db.batchSchedules ? db.batchSchedules.length : 0,
    lastUpdated: new Date().toISOString()
  });
});

// Default routes
server.use(router);

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
  console.log(`Serving data from: ${dbPath}`);
  
  // Print current collections in the database
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  console.log('Available collections:', Object.keys(db));
  if (db.batchSchedules) {
    console.log('Current batch schedules:', db.batchSchedules.length);
  } else {
    console.log('No batchSchedules collection found. It will be created when needed.');
  }
});
