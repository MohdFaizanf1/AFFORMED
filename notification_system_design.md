# Features Supported

- Fetch all notifications
- Fetch unread notifications
- Get a notification using ID
- Mark notification as read
- Mark all notifications as read
- Delete notification
- Get unread notification count
- Create notification
- Real-time notification updates


# Common Request Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```


# Base URL

```http
/api/v1/notifications
```

---

# 1. Fetch All Notifications

### Endpoint

```http
GET /api/v1/notifications
```

### Query Parameters

```http
?page=1&limit=10&type=Placement
```

### Sample Response

```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": [
    {
      "id": "101",
      "studentId": 1042,
      "type": "Placement",
      "message": "CSX Corporation hiring",
      "isRead": false,
      "createdAt": "2026-04-22T17:51:18Z"
    }
  ]
}
```

---

# 2. Fetch Unread Notifications

### Endpoint

```http
GET /api/v1/notifications/unread
```

### Sample Response

```json
{
  "success": true,
  "data": [
    {
      "id": "102",
      "studentId": 1042,
      "type": "Result",
      "message": "Mid-sem result declared",
      "isRead": false,
      "createdAt": "2026-04-22T17:51:30Z"
    }
  ]
}
```

---

# 3. Get Notification By ID

### Endpoint

```http
GET /api/v1/notifications/{notificationId}
```

### Sample Response

```json
{
  "success": true,
  "data": {
    "id": "103",
    "studentId": 1042,
    "type": "Event",
    "message": "Farewell scheduled on Friday",
    "isRead": false,
    "createdAt": "2026-04-22T17:51:06Z"
  }
}
```

---

# 4. Mark Notification As Read

### Endpoint

```http
PATCH /api/v1/notifications/{notificationId}/read
```

### Request Body

```json
{
  "isRead": true
}
```

### Sample Response

```json
{
  "success": true,
  "message": "Notification updated successfully"
}
```

---

# 5. Mark All Notifications As Read

### Endpoint

```http
PATCH /api/v1/notifications/read-all
```

### Sample Response

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

# 6. Delete Notification

### Endpoint

```http
DELETE /api/v1/notifications/{notificationId}
```

### Sample Response

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

# 7. Get Unread Notification Count

### Endpoint

```http
GET /api/v1/notifications/unread-count
```

### Sample Response

```json
{
  "success": true,
  "unreadCount": 8
}
```

---

# 8. Create Notification

This API can be used by admin, placement department or backend services.

### Endpoint

```http
POST /api/v1/notifications
```

### Request Body

```json
{
  "studentId": 1042,
  "type": "Placement",
  "message": "Advanced Micro Devices Inc. hiring"
}
```

### Sample Response

```json
{
  "success": true,
  "message": "Notification created successfully"
}
```

---

# Notification Object Structure

```json
{
  "id": "string",
  "studentId": "number",
  "type": "Event | Result | Placement",
  "message": "string",
  "isRead": "boolean",
  "createdAt": "timestamp"
}
```

---

# Error Response Format

```json
{
  "success": false,
  "message": "Notification not found"
}
```

---

# Real-Time Notification Mechanism

To provide instant notification updates, WebSocket connection can be used.

### WebSocket URL

```http
ws://localhost:8000/ws/notifications
```

Whenever a new notification is generated, the server pushes the event directly to the connected user.

### Example Event

```json
{
  "event": "NEW_NOTIFICATION",
  "data": {
    "id": "104",
    "type": "Placement",
    "message": "New placement drive announced",
    "isRead": false
  }
}
```


When the frontend receives a new notification:

- unread notification count should increase
- notification list should refresh automatically
- latest notification should appear on top
- unread notification should be highlighted