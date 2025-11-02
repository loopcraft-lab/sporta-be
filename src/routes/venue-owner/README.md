# Venue Owner Dashboard - Backend

## New Endpoints

### 1. Get Dashboard Stats
```
GET /venue-owner/my/dashboard?startDate=2025-01-01&endDate=2025-10-25
```

**Response:**
```json
{
  "summary": {
    "totalCourts": 5,
    "activeCourts": 4,
    "totalBookings": 150,
    "totalRevenue": 45000000,
    "avgUtilization": 67.5
  },
  "today": {
    "revenue": 2500000,
    "bookings": 8,
    "revenueGrowth": 15.5,
    "bookingsGrowth": 20.0,
    "upcomingBookings": [...]
  },
  "courtPerformance": [...],
  "recentBookings": [...],
  "alerts": [...]
}
```

### 2. Get Court Calendar
```
GET /venue-owner/my/courts/:courtId/calendar?month=2025-10
```

**Response:**
```json
{
  "court": {
    "id": 1,
    "name": "Sân 1",
    "sportType": "Bóng đá",
    "openingTime": "06:00",
    "closingTime": "22:00"
  },
  "bookingsByDate": {
    "2025-10-25": [
      {
        "id": 1,
        "startTime": "08:00",
        "endTime": "10:00",
        "status": "CONFIRMED",
        "paymentStatus": "PAID",
        "user": {...}
      }
    ]
  }
}
```

### 3. Get Bookings
```
GET /venue-owner/my/bookings?page=1&limit=20&courtId=1&status=CONFIRMED
```

### 4. Get Analytics
```
GET /venue-owner/my/analytics?startDate=2025-01-01&endDate=2025-10-25
```

## Files Changed

- ✅ `venue-owner.controller.ts` - Added 4 endpoints
- ✅ `venue-owner.dto.ts` - Added 3 query DTOs
- ✅ `venue-owner.service.ts` - Added 4 methods
- ✅ `venue-owner.module.ts` - Added PrismaService

## Test

```bash
# Start backend
npm run dev

# Test with curl
curl http://localhost:3000/venue-owner/my/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```
