# COMBAT OS - Military Battalion Operations System

🛡️ **COMBAT OS** adalah sistem operasi modular untuk manajemen batalyon militer yang terdiri dari frontend React modern dan backend Node.js yang scalable.

## 🚀 Fitur Utama

### MVP Features (Saat Ini)
- ✅ **Authentication**: Login dengan NRP (Military ID)
- ✅ **Dashboard Admin**: Status personel dan log scan
- ✅ **QR Code Scanning**: Scan pos dengan GPS validation
- ✅ **Exit Form**: Form keluar dengan tujuan, alasan, durasi, jadwal
- ✅ **Photo Capture**: Capture foto via kamera browser
- ✅ **Modular Architecture**: Sistem modul yang dapat diaktifkan/nonaktifkan

### Future Modules
- 🔄 **Logistics**: Manajemen logistik
- 🔄 **Security**: Tools keamanan
- 🔄 **Training**: Manajemen pelatihan

## 🏗️ Arsitektur Sistem

```
COMBAT OS
├── Frontend (Vite + React + Tailwind CSS)
│   ├── Login Page
│   ├── Dashboard
│   │   ├── Overview
│   │   ├── Scan Logs
│   │   ├── Personnel List
│   │   └── QR Scanner
│   └── Military UI Theme
│
├── Backend (Node.js + Express)
│   ├── JWT Authentication
│   ├── Modular Routes
│   │   ├── Personnel CRUD
│   │   ├── QR Scan API
│   │   ├── Exit Form API
│   │   └── Photo Upload API
│   └── GPS Validation
│
└── Database (SQLite/PostgreSQL)
    ├── Personnel Table
    ├── POS (Checkpoints) Table
    ├── Logs Table
    └── Modules Metadata
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **JWT** - Authentication
- **SQLite** (dev) / **PostgreSQL** (prod) - Database
- **qrcode** - QR code generation

### Database Schema
```sql
-- Personnel: id, nrp, name, rank, photo_url
-- POS: id, name, location, qr_code_id, latitude, longitude
-- Logs: id, personnel_id, pos_id, gps_lat, gps_long, photo_url, exit_form, timestamp
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone & Setup
```bash
git clone <repository-url>
cd combat-os
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm install
```

### 3. Setup Database
```bash
# Initialize SQLite database (development)
cd backend
node init-db.js
```

### 4. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
# Backend: cd backend && npm run dev
# Frontend: cd frontend && npm run dev
```

### 5. Access Application
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3000
- **Demo Login**: NRP: P001, P002, P003, P004

## 🔧 Environment Configuration

### Backend (.env)
```env
# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d

# Database (SQLite for dev)
# For production, set NODE_ENV=production and configure PostgreSQL

# Modules
MODULE_PERSONNEL=true
MODULE_QR_SCAN=true
MODULE_EXIT_FORM=true
MODULE_PHOTO_UPLOAD=true

# GPS
GPS_VALIDATION_ENABLED=true

# CORS
CORS_ORIGIN=http://localhost:5174
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with NRP
- `GET /api/auth/verify` - Verify JWT token

### Personnel
- `GET /api/personnel` - List all personnel
- `POST /api/personnel` - Create personnel
- `PUT /api/personnel/:id` - Update personnel
- `DELETE /api/personnel/:id` - Delete personnel

### QR Scan
- `GET /api/qr-scan/pos` - Get all POS
- `POST /api/qr-scan/scan` - Scan QR code with form & photo

### Logs
- `GET /api/logs` - Get scan logs

## 🔐 Security Features

- JWT token-based authentication
- GPS validation (optional, configurable)
- CORS protection
- Input validation
- SQL injection protection

## 🎨 UI/UX Design

- **Military Theme**: Dark blue/gray color scheme
- **Responsive**: Mobile-first design
- **Accessible**: High contrast, readable fonts
- **Modern**: Clean, professional interface

## 📦 Deployment

### Development
```bash
npm run dev  # Starts both frontend & backend
```

### Production
```bash
# Build frontend
npm run build

# Start backend
cd backend && npm start
```

### Free Hosting Options
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Render, Fly.io
- **Database**: Supabase, Railway, Neon

## 🧪 Testing

```bash
# Run tests
npm test

# Test API endpoints
curl http://localhost:3000/health
```

## 📚 Documentation

- `/dokumentasi/` - Project documentation
- API docs available at `/api/status`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

Military Use - Confidential

## 👥 Demo Accounts

| NRP  | Name              | Rank      |
|------|-------------------|-----------|
| P001 | Kapten Budi      | Kapten    |
| P002 | Sersan Ahmad     | Sersan    |
| P003 | Kopral Rini      | Kopral    |
| P004 | Prajurit Eko     | Prajurit  |

## 🔧 Troubleshooting

### Common Issues

1. **Camera not working**: Check browser permissions
2. **GPS not available**: Allow location access
3. **Database errors**: Run `node init-db.js` again
4. **Port conflicts**: Change PORT in .env

### Logs
```bash
# Backend logs
cd backend && npm run dev

# Frontend logs
cd frontend && npm run dev
```

---

**COMBAT OS** - Ready for military operations! 🛡️⚡