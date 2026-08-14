const path = require('path');
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'register.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      form_teacher TEXT,
      student_count INTEGER DEFAULT 0,
      avg_attendance INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      subject TEXT,
      class_assigned TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admission_no TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      class TEXT,
      guardian TEXT,
      fee_status TEXT DEFAULT 'due',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedAdmin();
}

function seedAdmin() {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (existing) return;
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
    .run('admin', hash, 'admin');
  console.log('Seeded default admin — username: admin / password: admin123');
}

function seedSampleData() {
  const firstNames = ['Ama','Kwame','Efua','Kojo','Adjoa','Kofi','Akosua','Yaw','Abena','Kwabena','Esi','Kwaku','Afia','Aba'];
  const lastNames = ['Boateng','Mensah','Owusu','Asante','Appiah','Osei','Agyeman','Darko','Sarpong','Amoah'];
  const classNames = ['KG 1','KG 2','Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','JHS 1A','JHS 1B','JHS 2A','JHS 2B','JHS 3A','JHS 3B'];
  const subjects = ['Mathematics','English Language','Science','Social Studies','ICT','French','RME'];
  const rand = arr => arr[Math.floor(Math.random() * arr.length)];

  const classCount = db.prepare('SELECT COUNT(*) AS c FROM classes').get().c;
  if (classCount === 0) {
    const insertClass = db.prepare('INSERT INTO classes (name, form_teacher, student_count, avg_attendance) VALUES (?, ?, ?, ?)');
    classNames.forEach(c => {
      insertClass.run(c, `${rand(firstNames)} ${rand(lastNames)}`, 18 + Math.floor(Math.random() * 20), 82 + Math.floor(Math.random() * 16));
    });
    console.log(`Seeded ${classNames.length} classes`);
  }

  const teacherCount = db.prepare('SELECT COUNT(*) AS c FROM teachers').get().c;
  if (teacherCount === 0) {
    const insertTeacher = db.prepare('INSERT INTO teachers (staff_id, name, subject, class_assigned, status) VALUES (?, ?, ?, ?, ?)');
    for (let i = 1; i <= 16; i++) {
      insertTeacher.run(`STF-${200 + i}`, `${rand(firstNames)} ${rand(lastNames)}`, rand(subjects), rand(classNames), Math.random() > 0.1 ? 'active' : 'leave');
    }
    console.log('Seeded 16 teachers');
  }

  const studentCount = db.prepare('SELECT COUNT(*) AS c FROM students').get().c;
  if (studentCount === 0) {
    const insertStudent = db.prepare('INSERT INTO students (admission_no, name, class, guardian, fee_status) VALUES (?, ?, ?, ?, ?)');
    for (let i = 1; i <= 40; i++) {
      insertStudent.run(`STD-${1000 + i}`, `${rand(firstNames)} ${rand(lastNames)}`, rand(classNames), `${rand(firstNames)} ${rand(lastNames)}`, Math.random() > 0.22 ? 'paid' : 'due');
    }
    console.log('Seeded 40 students');
  }
}

init();

if (require.main === module && process.argv.includes('--seed')) {
  seedSampleData();
}

module.exports = { db, seedSampleData };
