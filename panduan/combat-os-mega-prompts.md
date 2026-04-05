# COMBAT OS — 4 Mega Prompt untuk GitHub Copilot Chat
> Gunakan prompt ini secara berurutan di GitHub Copilot Chat (Codespace).  
> Paste satu prompt per sesi, tunggu selesai sebelum lanjut ke prompt berikutnya.

---

# ═══════════════════════════════════════
# MEGA PROMPT 1 — SECURITY CRITICAL FIX
# Sprint 1: Autentikasi, Password, JWT, Role System
# ═══════════════════════════════════════

```
You are an expert Node.js security engineer. I need you to fix ALL critical security vulnerabilities in this military operations system (COMBAT OS). Work through every file I specify and make all changes in one go. Do NOT skip any step.

## CONTEXT
This is a military battalion management system built with:
- Backend: Node.js + Express + SQLite (dev) / PostgreSQL (prod)
- Frontend: React 18 + Vite + Tailwind CSS
- Auth: JWT

## CRITICAL SECURITY PROBLEMS TO FIX

---

### FIX 1 — Update Database Schema (database/schema.sql)

Add `password_hash` and `role` columns to the `personnel` table. Replace the existing CREATE TABLE personnel statement with this:

```sql
CREATE TABLE personnel (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  nrp TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  rank TEXT,
  role TEXT NOT NULL DEFAULT 'personel' CHECK(role IN ('admin', 'personel')),
  password_hash TEXT NOT NULL,
  photo_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Also update the seed.sql to include hashed passwords. For now use placeholder hash for 'password123' using bcrypt with 12 rounds. Add a comment saying "replace these hashes in production". Add role='admin' for P001.

---

### FIX 2 — Install Required Packages

Add these to backend/package.json dependencies and run npm install:
- bcryptjs (for password hashing)
- express-rate-limit (for rate limiting)
- express-validator (for input validation)
- helmet (for security headers)

---

### FIX 3 — Fix JWT Utility (backend/src/utils/jwt.js)

Rewrite this file completely:
1. Add a startup check: if JWT_SECRET is not set in env, throw an error immediately with message "CRITICAL: JWT_SECRET environment variable is required. Server cannot start without it."
2. Remove the fallback `'default_super_secret_key'`
3. Add a `blacklistToken` function that stores invalidated tokens in a Set (in-memory for now)
4. Add an `isTokenBlacklisted` function
5. Export all functions properly

---

### FIX 4 — Rewrite Auth Route (backend/src/routes/auth.js)

Rewrite the entire file with these requirements:
1. Import bcryptjs, express-rate-limit, express-validator
2. Add rate limiting: max 5 login attempts per 15 minutes per IP
3. POST /login must:
   - Validate that BOTH `nrp` AND `password` are provided (return 400 if either missing)
   - Find user by NRP from database
   - If user not found, return 401 with generic message "Invalid credentials" (never reveal if NRP exists)
   - Check `is_active` field — if 0, return 403 with "Account is deactivated"
   - Use bcrypt.compare() to verify password against `password_hash`
   - If password wrong, return 401 with "Invalid credentials"
   - On success: update `last_login` timestamp, generate JWT that includes `{ id, nrp, name, rank, role }`, return token + safe user object (no password_hash)
4. GET /verify must:
   - Use `authMiddleware` (import it)
   - Return the decoded user from req.user
5. POST /logout must:
   - Use `authMiddleware`
   - Call `blacklistToken` with the token from Authorization header
   - Return 200

---

### FIX 5 — Update Auth Middleware (backend/src/middleware/auth.js)

Rewrite to:
1. Import `isTokenBlacklisted` from jwt utils
2. In `authMiddleware`: after verifying token, check if it's blacklisted — if yes, return 401 "Token has been revoked"
3. Add a new `requireRole(...roles)` middleware factory:
```js
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  next();
};
```

---

### FIX 6 — Fix Logs Route (backend/src/routes/logs.js)

Replace `const isAdmin = req.query.admin === 'true'` with proper role check:
```js
import { requireRole } from '../middleware/auth.js';

// For admin route, use: authMiddleware, requireRole('admin')
// For personal logs, use: authMiddleware
// isAdmin should come from: const isAdmin = req.user?.role === 'admin';
```
Apply the same fix in backend/src/modules/exitForm/router.js

---

### FIX 7 — Add Helmet to Server (backend/src/server.js)

1. Import and add `helmet()` as the FIRST middleware after `app = express()`
2. Add rate limiting import and apply to all routes: max 200 requests per 15 minutes
3. In error handler middleware, do NOT expose `error` object in production:
```js
error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
```

---

### FIX 8 — Fix Frontend Login (frontend/src/utils/api.js)

Update the login function to send both nrp and password:
```js
login: (nrp, password) => apiClient.post('/auth/login', { nrp, password }),
```

Add logout function:
```js
logout: () => apiClient.post('/auth/logout'),
```

---

### FIX 9 — Fix useAuth Hook (frontend/src/hooks/useAuth.js)

1. Update `login` function signature to `(nrp, password)` and pass both to `authAPI.login(nrp, password)`
2. Update `logout` function to call `await authAPI.logout()` before clearing storage
3. In `verifyToken` effect: the verify call now has authMiddleware so it will work properly

---

### FIX 10 — Fix .gitignore (root .gitignore)

Rewrite .gitignore to properly exclude:
```
node_modules/
.env
.env.local
.env.production
*.db
*.sqlite
dist/
build/
uploads/
*.log
.DS_Store
```

---

### FIX 11 — Update .env.example (backend/.env.example)

Replace JWT_SECRET value with a comment instructing how to generate a proper secret:
```
# Generate with: openssl rand -base64 64
JWT_SECRET=REPLACE_WITH_GENERATED_SECRET_MINIMUM_64_CHARS
```
Remove all actual credential values, replace with REPLACE_WITH_YOUR_VALUE placeholders.

---

After all changes, provide a summary checklist of every file modified and confirm all 11 fixes are applied.
```

---

# ═══════════════════════════════════════
# MEGA PROMPT 2 — BUG CRITICAL FIX
# Sprint 2: Route Mismatch, SQLite Compat, Verify Endpoint
# ═══════════════════════════════════════

```
You are an expert Node.js/Express debugging engineer. Fix all critical runtime bugs in this COMBAT OS military system. Every bug listed below causes features to completely fail in production. Fix all of them.

## CONTEXT
Stack: Node.js + Express + SQLite (dev) / PostgreSQL (prod) + React 18 frontend

## BUG LIST — FIX ALL OF THESE

---

### BUG 1 — Module URL Path Mismatch (BREAKS ALL DYNAMIC MODULES)

File: backend/src/modules/moduleLoader.js

PROBLEM: The `registerModules` function registers routes using module names directly:
```js
const basePath = `/api/${moduleName}`;
// Results in: /api/qr_scan, /api/exit_form, /api/photo_upload
```

But frontend calls these endpoints with dashes:
```js
apiClient.get('/qr-scan/pos')        // expects /api/qr-scan
apiClient.post('/exit-form/submit')  // expects /api/exit-form
apiClient.post('/photo-upload/attach') // expects /api/photo-upload
```

FIX: In the `registerModules` function, add a path mapping object and use it:
```js
const MODULE_PATH_MAP = {
  qr_scan: 'qr-scan',
  exit_form: 'exit-form',
  photo_upload: 'photo-upload',
  personnel: 'personnel',
};

const basePath = `/api/${MODULE_PATH_MAP[moduleName] || moduleName.replace(/_/g, '-')}`;
```
Also add a console.log showing the actual registered path so it's visible in startup logs.

---

### BUG 2 — SQLite vs PostgreSQL Placeholder Incompatibility

PROBLEM: All module routers use PostgreSQL-style placeholders ($1, $2, etc.) but development uses SQLite which requires ? placeholders. This means ALL queries fail in development.

File: backend/src/db/connection.js

FIX: Update the `querySqlite` function to automatically convert PostgreSQL-style placeholders to SQLite-style before execution:

```js
const convertPlaceholders = (text) => {
  // Convert $1, $2, $3... to ?, ?, ?...
  return text.replace(/\$\d+/g, '?');
};

const querySqlite = async (text, params = []) => {
  const database = await getSqliteDb();
  const convertedText = convertPlaceholders(text);
  // ... rest of the function using convertedText instead of text
};
```

Also convert RETURNING clauses since SQLite doesn't support RETURNING:
```js
const handleReturning = async (database, text, params) => {
  if (text.toUpperCase().includes('RETURNING')) {
    // Execute the statement
    const result = await database.run(text.replace(/RETURNING.*/i, ''), params);
    // Then fetch the inserted/updated row using lastID or a WHERE clause
    if (text.trim().toUpperCase().startsWith('INSERT')) {
      const fetched = await database.get('SELECT * FROM ' + extractTableName(text) + ' WHERE rowid = ?', [result.lastID]);
      return { rows: fetched ? [fetched] : [], rowCount: result.changes };
    }
    return { rows: [], rowCount: result.changes };
  }
};

const extractTableName = (sql) => {
  const match = sql.match(/(?:INSERT INTO|UPDATE|DELETE FROM)\s+(\w+)/i);
  return match ? match[1] : '';
};
```

Integrate this into querySqlite so RETURNING queries work in SQLite dev mode.

---

### BUG 3 — /api/auth/verify Has No Auth Middleware

File: backend/src/routes/auth.js

PROBLEM: The verify endpoint checks `if (!req.user)` but there's no middleware that sets `req.user`. Result: verify always returns 401.

FIX:
1. Import `authMiddleware` from middleware/auth.js
2. Add it to the verify route: `router.get('/verify', authMiddleware, (req, res) => {...})`
3. Now `req.user` will be properly set from the decoded JWT

---

### BUG 4 — /api/logs Uses optionalAuthMiddleware But Route Needs Auth

File: backend/src/server.js

PROBLEM:
```js
app.use('/api/logs', optionalAuthMiddleware, logsRoutes);
// But inside logsRoutes, routes use authMiddleware again
```
This is inconsistent — if the outer optional middleware is there, the inner mandatory one creates confusion.

FIX: Remove `optionalAuthMiddleware` from the logs route in server.js since the inner route already handles auth:
```js
app.use('/api/logs', logsRoutes); // Let the inner routes handle their own auth
```

---

### BUG 5 — Photo Upload Module Has No Actual File Upload Logic

File: backend/src/modules/photoUpload/router.js

PROBLEM: The module only stores a `photo_url` string — there is no actual file upload endpoint. The frontend QR scanner captures photos but there's no way to upload them.

FIX: Add a proper file upload endpoint using multer:
1. Add multer to package.json
2. Add POST /api/photo-upload/upload endpoint that:
   - Accepts multipart/form-data with a `photo` field
   - Saves file to `./uploads/` directory (create if not exists)
   - Returns a `photo_url` pointing to the saved file
   - Validates file type (only image/jpeg, image/png, image/webp allowed)
   - Limits file size to 5MB
3. Add `app.use('/uploads', express.static('uploads'))` in server.js to serve uploaded files

---

### BUG 6 — Missing Error Boundary and Undefined Navigation States

File: frontend/src/App.jsx

PROBLEM: There is no catch-all error boundary. If any component throws, the entire app crashes with a white screen.

FIX: Add a simple ErrorBoundary class component:
```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'monospace' }}>
          <h2>⚠ System Error</h2>
          <p>An unexpected error occurred. Please refresh the page.</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```
Wrap the entire Router with `<ErrorBoundary>`.

---

### BUG 7 — init-db.js Not Synced with schema.sql

File: backend/init-db.js

PROBLEM: There are two sources of truth for the schema. If they diverge, development database will have different structure than production.

FIX: Rewrite init-db.js to READ and EXECUTE database/schema.sql directly instead of having its own schema definition:
```js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initDb() {
  const schemaPath = path.join(__dirname, '../database/schema.sql');
  const seedPath = path.join(__dirname, '../database/seed.sql');
  
  const db = await open({ filename: './combat_os.db', driver: sqlite3.Database });
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const seed = fs.readFileSync(seedPath, 'utf8');
  
  // Execute schema
  await db.exec(schema);
  console.log('✅ Schema applied from schema.sql');
  
  // Execute seed
  await db.exec(seed);
  console.log('✅ Seed data inserted from seed.sql');
  
  await db.close();
  console.log('✅ Database initialized successfully');
}

initDb().catch(console.error);
```

---

After all fixes, run a startup check mentally and confirm:
1. All module routes are accessible at the correct paths
2. SQLite queries work in development with ? placeholders
3. /api/auth/verify returns user data when valid token provided
4. Photo upload creates actual files
5. App doesn't crash on component errors

List all files modified with a brief description of changes.
```

---

# ═══════════════════════════════════════
# MEGA PROMPT 3 — ARCHITECTURE UPGRADE
# Sprint 3: Service Layer, Database, Frontend Security
# ═══════════════════════════════════════

```
You are a senior software architect. Upgrade the COMBAT OS system architecture from a basic MVP to a proper layered architecture. This is a military system — it needs proper structure, data modeling, and frontend security hardening.

## CONTEXT
Stack: Node.js + Express + SQLite (dev) / PostgreSQL (prod) + React 18 + Tailwind CSS

## ARCHITECTURE UPGRADES — IMPLEMENT ALL

---

### UPGRADE 1 — Add Service Layer (No More Business Logic in Routes)

Create these service files. Each service contains the actual business logic that was previously directly in route handlers.

**File: backend/src/services/personnelService.js**
```js
// Personnel business logic
export const personnelService = {
  async findAll(db) { /* query all active personnel */ },
  async findById(db, id) { /* query single personnel by UUID */ },
  async findByNrp(db, nrp) { /* query by NRP including password_hash */ },
  async create(db, { nrp, name, rank, role, password }) {
    // 1. Validate NRP uniqueness
    // 2. Hash password with bcrypt (12 rounds)
    // 3. Insert into database
    // 4. Return created record without password_hash
  },
  async update(db, id, data) {
    // Only allow updating: name, rank, photo_url, is_active
    // Update updated_at timestamp
  },
  async deactivate(db, id) { /* set is_active = 0 instead of hard delete */ },
  async updateLastLogin(db, id) { /* update last_login timestamp */ },
};
```

**File: backend/src/services/scanService.js**
```js
export const scanService = {
  async getAllPos(db) { /* fetch all checkpoints */ },
  async findPosByQrCode(db, qrCodeId) { /* find checkpoint by QR ID */ },
  async recordScan(db, { personnelId, posId, gpsLat, gpsLong, photoUrl, exitForm }) {
    // 1. Validate personnel exists and is active
    // 2. Validate pos exists
    // 3. Insert scan log
    // 4. Return log entry with formatted data
  },
};
```

**File: backend/src/services/logService.js**
```js
export const logService = {
  async findAll(db, { isAdmin, userId, limit = 100, offset = 0 }) {
    // If not admin: filter by userId
    // Always: JOIN personnel and pos tables
    // Always: parse exit_form JSON
    // Support pagination via limit/offset
  },
  async findById(db, id, userId, isAdmin) {
    // Find log by ID
    // If not admin: verify log belongs to userId
    // Return 403 if unauthorized
  },
};
```

Now update ALL route handlers to use these services instead of direct query calls. Routes should only handle: request parsing, calling service, sending response.

---

### UPGRADE 2 — Create Separate exit_forms Table

File: database/schema.sql

Add a proper exit_forms table (keep backward compat by keeping exit_form JSON in logs too for now, but add the relational table):

```sql
CREATE TABLE exit_forms (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  log_id TEXT NOT NULL UNIQUE,
  tujuan TEXT NOT NULL DEFAULT '',
  alasan_keluar TEXT NOT NULL DEFAULT '',
  durasi_jam INTEGER,
  jadwal_kembali DATETIME,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  approved_by TEXT,
  approved_at DATETIME,
  notes TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (log_id) REFERENCES logs(id),
  FOREIGN KEY (approved_by) REFERENCES personnel(id)
);

CREATE INDEX idx_exit_forms_log_id ON exit_forms(log_id);
CREATE INDEX idx_exit_forms_status ON exit_forms(status);
```

Update exit_forms router to INSERT into this new table instead of updating the logs.exit_form JSON column. Keep backward compat by also updating the JSON column.

---

### UPGRADE 3 — Add Pagination to All List Endpoints

Update these routes to support `?page=1&limit=20` query params:
- GET /api/logs
- GET /api/personnel
- GET /api/exit-form/logs

Standard response format for paginated endpoints:
```js
{
  success: true,
  data: [...],
  pagination: {
    total: 150,
    page: 1,
    limit: 20,
    totalPages: 8,
    hasNext: true,
    hasPrev: false
  }
}
```

For SQLite, use: `SELECT COUNT(*) as total FROM table` then `SELECT * FROM table LIMIT ? OFFSET ?`

---

### UPGRADE 4 — Replace localStorage with httpOnly Cookies (Frontend Security)

This is critical for a military app. XSS attacks can steal localStorage tokens.

File: frontend/src/utils/api.js
1. Remove ALL `localStorage` references for token storage
2. Add `withCredentials: true` to the axios instance config
3. Remove the Authorization header interceptor (token is now in cookie)
4. The backend will set and clear the cookie

File: frontend/src/utils/storage.js
1. Remove `getToken`, `setToken`, `removeToken` functions
2. Keep `getUser`, `setUser`, `removeUser` (user profile data is fine in localStorage)
3. Update `isAuthenticated` to use a different check — call the verify endpoint instead of checking localStorage

File: frontend/src/hooks/useAuth.js
1. Remove token handling from login function
2. Login now just calls API and stores user object in state + localStorage (not token)
3. Add an `initialized` state — on mount, call `authAPI.verify()` to check if session cookie is valid. If valid, set user. If not, clear user.

File: backend/src/routes/auth.js
1. On successful login, instead of returning token in body, set it as httpOnly cookie:
```js
res.cookie('authToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
});
```
2. On logout, clear the cookie:
```js
res.clearCookie('authToken');
```

File: backend/src/middleware/auth.js
1. Import `cookie-parser` (add to package.json)
2. Update token extraction to read from cookie first, then fall back to Authorization header:
```js
const token = req.cookies?.authToken || extractTokenFromHeader(req.headers.authorization);
```

File: backend/src/server.js
1. Add `cookie-parser` middleware: `app.use(cookieParser())`

---

### UPGRADE 5 — Add Standardized API Response Helper

Create file: backend/src/utils/response.js
```js
export const ApiResponse = {
  success: (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  },
  paginated: (res, data, pagination, message = 'Success') => {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    });
  },
  error: (res, message, statusCode = 500, details = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(details && process.env.NODE_ENV === 'development' ? { details } : {}),
      timestamp: new Date().toISOString(),
    });
  },
  notFound: (res, resource = 'Resource') => {
    return ApiResponse.error(res, `${resource} not found`, 404);
  },
  unauthorized: (res, message = 'Authentication required') => {
    return ApiResponse.error(res, message, 401);
  },
  forbidden: (res, message = 'Insufficient permissions') => {
    return ApiResponse.error(res, message, 403);
  },
  badRequest: (res, message) => {
    return ApiResponse.error(res, message, 400);
  },
};
```

Update ALL route handlers to use `ApiResponse` instead of manual `res.status(X).json(...)`.

---

### UPGRADE 6 — Add Input Validation with express-validator

Create file: backend/src/validators/personnelValidator.js
```js
import { body, validationResult } from 'express-validator';

export const validateCreatePersonnel = [
  body('nrp').trim().notEmpty().withMessage('NRP is required').matches(/^[A-Z0-9]+$/).withMessage('NRP must be alphanumeric uppercase'),
  body('name').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('rank').optional().trim().isLength({ max: 50 }),
  body('role').optional().isIn(['admin', 'personel']),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};
```

Create file: backend/src/validators/authValidator.js
```js
export const validateLogin = [
  body('nrp').trim().notEmpty().withMessage('NRP is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];
```

Apply these validators to the relevant route handlers.

---

After all upgrades, confirm:
1. List all new files created
2. List all files modified
3. Confirm service layer is between routes and database in ALL modules
4. Confirm cookies are used for auth (not localStorage tokens)
5. Confirm pagination works on all list endpoints
```

---

# ═══════════════════════════════════════
# MEGA PROMPT 4 — PRODUCTION READINESS
# Sprint 4: Logging, Testing, Docker, Migrations
# ═══════════════════════════════════════

```
You are a DevOps and backend reliability engineer. Make COMBAT OS production-ready. Implement proper logging, testing infrastructure, database migrations, Docker setup, and deployment configuration. This is a military-grade system that must be reliable.

## CONTEXT
Stack: Node.js + Express + SQLite (dev) / PostgreSQL (prod) + React 18 + Vite + Tailwind CSS

## PRODUCTION UPGRADES — IMPLEMENT ALL

---

### TASK 1 — Replace console.log with Structured Logging (Pino)

Add `pino` and `pino-pretty` to backend/package.json.

Create file: backend/src/utils/logger.js
```js
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDev ? {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' }
  } : undefined,
  base: { service: 'combat-os', env: process.env.NODE_ENV },
  redact: ['req.headers.authorization', 'body.password', 'body.password_hash'],
});

export const httpLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${Date.now() - start}ms`,
      ip: req.ip,
      user: req.user?.nrp || 'anonymous',
    }, 'HTTP Request');
  });
  next();
};
```

Replace ALL `console.log`, `console.error`, `console.warn` in the entire backend with `logger.info`, `logger.error`, `logger.warn`. Import logger in every file that needs it.

---

### TASK 2 — Create Database Migration System

Install `node-pg-migrate` for PostgreSQL or create a simple custom migration system.

Create directory: backend/src/migrations/

Create file: backend/src/migrations/migrationRunner.js
```js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../db/connection.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations() {
  // Create migrations tracking table if not exists
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrationsDir = __dirname;
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.match(/^\d{4}_.*\.sql$/))
    .sort();

  for (const file of migrationFiles) {
    const { rows } = await query('SELECT id FROM _migrations WHERE name = ?', [file]);
    if (rows.length > 0) {
      logger.debug({ migration: file }, 'Migration already applied, skipping');
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await query(sql);
    await query('INSERT INTO _migrations (name) VALUES (?)', [file]);
    logger.info({ migration: file }, 'Migration applied');
  }
}
```

Create migration files:
- `backend/src/migrations/0001_initial_schema.sql` — copy entire content of database/schema.sql
- `backend/src/migrations/0002_add_exit_forms_table.sql` — the new exit_forms table from Sprint 3
- `backend/src/migrations/0003_add_audit_log.sql`:
```sql
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  performed_by TEXT,
  old_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_by ON audit_log(performed_by);
```

Call `runMigrations()` in server.js `startServer()` function before loading modules.

---

### TASK 3 — Write Unit Tests

Install: `vitest`, `@vitest/coverage-v8`, `supertest` in backend devDependencies.

Create file: backend/src/utils/__tests__/gps.test.js
```js
import { describe, it, expect } from 'vitest';
import { calculateDistance, isWithinRadius, isValidGPS } from '../gps.js';

describe('GPS Utils', () => {
  describe('isValidGPS', () => {
    it('should return true for valid coordinates', () => {
      expect(isValidGPS(-6.2088, 106.8456)).toBe(true);
    });
    it('should return false for latitude > 90', () => {
      expect(isValidGPS(91, 0)).toBe(false);
    });
    it('should return false for longitude > 180', () => {
      expect(isValidGPS(0, 181)).toBe(false);
    });
    it('should handle edge cases: exactly ±90 lat', () => {
      expect(isValidGPS(90, 0)).toBe(true);
      expect(isValidGPS(-90, 0)).toBe(true);
    });
  });

  describe('calculateDistance', () => {
    it('should return 0 for same coordinates', () => {
      expect(calculateDistance(0, 0, 0, 0)).toBe(0);
    });
    it('should calculate distance between Jakarta coordinates correctly', () => {
      // Known distance: POS 1 to POS 2 in seed data
      const dist = calculateDistance(-6.2088, 106.8456, -6.2095, 106.8465);
      expect(dist).toBeGreaterThan(50);
      expect(dist).toBeLessThan(200);
    });
  });

  describe('isWithinRadius', () => {
    it('should return true when user is within radius', () => {
      expect(isWithinRadius(-6.2088, 106.8456, -6.2088, 106.8456, 100)).toBe(true);
    });
    it('should return false when user is outside radius', () => {
      expect(isWithinRadius(-6.2088, 106.8456, -6.3000, 106.9000, 100)).toBe(false);
    });
  });
});
```

Create file: backend/src/utils/__tests__/jwt.test.js
```js
import { describe, it, expect, beforeAll } from 'vitest';
import { generateToken, verifyToken, extractTokenFromHeader } from '../jwt.js';

beforeAll(() => {
  process.env.JWT_SECRET = 'test_secret_that_is_long_enough_for_testing_purposes_minimum_32';
});

describe('JWT Utils', () => {
  const payload = { id: 'test-id', nrp: 'P001', role: 'admin' };

  it('should generate a valid token', () => {
    const token = generateToken(payload);
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('should verify and decode a valid token', () => {
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.nrp).toBe('P001');
    expect(decoded.role).toBe('admin');
  });

  it('should throw on invalid token', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      expect(extractTokenFromHeader('Bearer mytoken123')).toBe('mytoken123');
    });
    it('should return null for missing header', () => {
      expect(extractTokenFromHeader(null)).toBeNull();
    });
    it('should return null for non-Bearer auth', () => {
      expect(extractTokenFromHeader('Basic abc123')).toBeNull();
    });
  });
});
```

Add test script to backend/package.json:
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

---

### TASK 4 — Create Docker Setup

Create file: docker-compose.yml (root level)
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/app
      - /app/node_modules
      - uploads_data:/app/uploads
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5174:5174"
    env_file:
      - ./frontend/.env
    volumes:
      - ./frontend:/app
      - /app/node_modules
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: combat_os
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres_dev_password}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
    restart: unless-stopped

volumes:
  postgres_data:
  uploads_data:
```

Create file: backend/Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
```

Create file: frontend/Dockerfile
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create file: frontend/nginx.conf
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### TASK 5 — Add Health Check Endpoint with Real System Info

Update file: backend/src/server.js

Replace the simple `/health` with a meaningful health check:
```js
app.get('/health', async (req, res) => {
  const checks = {
    server: 'ok',
    database: 'unknown',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
    },
  };

  try {
    await query('SELECT 1');
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  const isHealthy = checks.database === 'ok';
  return res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  });
});
```

---

### TASK 6 — Add Graceful Shutdown

Add to the bottom of backend/src/server.js:
```js
const gracefulShutdown = (signal) => {
  logger.info({ signal }, 'Received shutdown signal');
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Close database connections
    if (pgPool) await pgPool.end();
    if (sqliteDb) await sqliteDb.close();
    
    logger.info('Database connections closed');
    logger.info('COMBAT OS shutdown complete');
    process.exit(0);
  });

  // Force exit after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

---

### TASK 7 — Create README for Deployment

Create/update root README.md with:
1. Clear prerequisites section (Node.js 20+, Docker, PostgreSQL)
2. Development setup with Docker Compose: `docker-compose up -d`
3. Development setup without Docker: step-by-step instructions
4. How to run migrations: `npm run migrate`
5. How to run tests: `npm test`
6. How to build for production: `npm run build`
7. Environment variables reference table with: variable name, description, required/optional, example value — for ALL env vars
8. Security notes: how to generate JWT_SECRET, what NOT to commit
9. API endpoints reference (all routes with method, path, auth required, description)

---

After all tasks complete:
1. Run `npm test` in backend and confirm all tests pass
2. Run `docker-compose build` (dry run description)
3. List every new file created
4. List every file modified
5. Provide final production deployment checklist:
   - [ ] JWT_SECRET generated with openssl rand -base64 64
   - [ ] .env not in git repository
   - [ ] Database initialized with migrations
   - [ ] All tests passing
   - [ ] Docker images build successfully
   - [ ] Health check returns 200
   - [ ] Rate limiting active on /api/auth/login
   - [ ] Passwords hashed with bcrypt (never plaintext)
```

---

## Urutan Penggunaan

| Prompt | Sprint | Fokus | Estimasi Waktu |
|---|---|---|---|
| **Prompt 1** | Sprint 1 | Security Critical — Auth, Password, JWT, Role | 30-60 menit |
| **Prompt 2** | Sprint 2 | Bug Critical — Route mismatch, SQLite, Verify | 20-40 menit |
| **Prompt 3** | Sprint 3 | Architecture — Service layer, DB, Cookie auth | 45-90 menit |
| **Prompt 4** | Sprint 4 | Production — Logging, Tests, Docker, Migration | 30-60 menit |

> ⚠️ **Penting:** Setelah setiap prompt, lakukan `git commit` sebelum lanjut ke prompt berikutnya. Jika ada error, tempel pesan error ke Copilot Chat di sesi yang sama dan minta perbaikan.
