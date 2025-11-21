# 🔧 Deployment Fix - Static Files 404 Issue

## 📋 Changes Made

### 1. **Fixed Static File Serving** (`src/main.ts`)
- ✅ Moved `useStaticAssets` **before** `setGlobalPrefix`
- ✅ Added `uploads/*` to globalPrefix exclude list
- ✅ Ensures `/uploads/venue/xxx.jpg` works without API prefix

### 2. **Fixed Environment Variables** (`.env`)
- ✅ Added missing `POSTGRES_DB=sporta`
- ✅ Added missing `POSTGRES_USER=postgres`
- ✅ Added missing `POSTGRES_PASSWORD=postgres`
- ✅ Added missing `REDIS_PASSWORD=sporta`
- ✅ Removed duplicate commented sections

---

## 🚀 Deployment Steps

### Step 1: Clean up existing containers
```bash
# Stop all sporta containers
docker stop sporta-postgres sporta-redis sporta-app 2>/dev/null

# Remove all sporta containers
docker rm sporta-postgres sporta-redis sporta-app 2>/dev/null

# Optional: Clean up volumes (⚠️ This will DELETE all data!)
# docker volume rm sporta-be_postgres_data sporta-be_redis_data
```

### Step 2: Rebuild and restart
```bash
# Rebuild the app image (to include main.ts changes)
docker-compose build app

# Start all services
docker-compose up -d
```

### Step 3: Verify services are running
```bash
# Check container status
docker-compose ps

# Expected output:
# NAME              STATUS          PORTS
# sporta-postgres   Up             0.0.0.0:5432->5432/tcp
# sporta-redis      Up             0.0.0.0:6379->6379/tcp  
# sporta-app        Up             0.0.0.0:4000->4000/tcp
```

### Step 4: Check logs
```bash
# View app logs
docker logs sporta-app -f

# You should see:
# 🏆 Welcome to SPORTA! 🏆
# Server running on http://[::]:4000
```

### Step 5: Test static file serving
```bash
# Test API endpoint (should work)
curl -I http://160.25.81.229:3000/venue-owner

# Test static file (should now return 200 OK)
curl -I http://160.25.81.229:3000/uploads/venue/0d1bcf54-04a8-4898-9c89-5974d0b7d9cc.jpg

# Expected: HTTP/1.1 200 OK
```

---

## 🐛 Troubleshooting

### If static files still return 404:
```bash
# 1. Check if uploads folder exists in container
docker exec sporta-app ls -la /app/uploads/venue | head -10

# 2. Check if volume is mounted correctly
docker inspect sporta-app | grep -A 10 Mounts

# 3. Verify file permissions
docker exec sporta-app ls -lh /app/uploads/venue/0d1bcf54-04a8-4898-9c89-5974d0b7d9cc.jpg
```

### If containers fail to start:
```bash
# Check for port conflicts
lsof -i :5432  # Postgres
lsof -i :6379  # Redis
lsof -i :4000  # App

# View full error logs
docker-compose logs app
```

### If env variables not loading:
```bash
# Verify .env file is in the same directory as docker-compose.yml
ls -la .env

# Check if variables are loaded in container
docker exec sporta-app env | grep POSTGRES
docker exec sporta-app env | grep REDIS
```

---

## ✅ Verification Checklist

- [ ] Docker compose warnings gone (no "variable not set")
- [ ] All 3 containers running (postgres, redis, app)
- [ ] App logs show successful startup
- [ ] API endpoints working: `GET /venue-owner`
- [ ] Static files accessible: `GET /uploads/venue/xxx.jpg`
- [ ] Frontend can load venue images

---

## 📝 Files Changed

1. **`src/main.ts`** - Fixed static file serving order
2. **`.env`** - Added missing Docker Compose variables

## 🔐 Security Note

⚠️ **Remember to update `.env` with secure passwords before production deployment!**

```bash
# Change these in production:
POSTGRES_PASSWORD=<use-strong-password>
REDIS_PASSWORD=<use-strong-password>
ACCESS_TOKEN_SECRET=<use-random-secret>
REFRESH_TOKEN_SECRET=<use-random-secret>
```
