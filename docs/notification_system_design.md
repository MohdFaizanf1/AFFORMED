# Stage 1

## Notification API Design

This document contains the API structure for the notification system. These APIs will help the frontend display notifications to logged-in users.

 

## Features Supported


- View all notifications
- View unread notifications
- Mark notification as read
- Mark all notifications as read
- Delete notification
- Get unread notification count
- Receive real-time notifications



## Common Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

 

## Base URL

```http
/api/v1/notifications
```

 

## 1. Get All Notifications

**Method:** GET

**Endpoint:**

```http
/api/v1/notifications
```

**Response:**

```json
{
  "success": true,
  "notifications": [
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

 

## 2. Get Unread Notifications

**Method:** GET

**Endpoint:**

```http
/api/v1/notifications/unread
```

**Response:**

```json
{
  "success": true,
  "notifications": [
    {
      "id": "102",
      "type": "Result",
      "message": "Mid-sem result declared",
      "isRead": false
    }
  ]
}
```

 

## 3. Mark Notification As Read

**Method:** PATCH

**Endpoint:**

```http
/api/v1/notifications/{notificationId}/read
```

**Request Body:**

```json
{
  "isRead": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

 

## 4. Mark All Notifications As Read

**Method:** PATCH

**Endpoint:**

```http
/api/v1/notifications/read-all
```

**Response:**

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

 

## 5. Delete Notification

**Method:** DELETE

**Endpoint:**

```http
/api/v1/notifications/{notificationId}
```

**Response:**

```json
{
  "success": true,
  "message": "Notification deleted"
}
```

 

## 6. Get Unread Notification Count

**Method:** GET

**Endpoint:**

```http
/api/v1/notifications/unread-count
```

**Response:**

```json
{
  "success": true,
  "unreadCount": 8
}
```

 

## Real-Time Notification Mechanism

For real-time notifications, WebSocket can be used.

When a new notification is created, the server sends it instantly to the frontend without refreshing the page.

**WebSocket URL:**

```http
ws://localhost:8000/ws/notifications
```

Example event:

```json
{
  "event": "NEW_NOTIFICATION",
  "message": "New placement drive announced"
}
```

 

## Middleware Used

### Authentication Middleware

Checks whether the user is logged in or not.

### Logging Middleware

Stores API request details like endpoint, status code, and response time.

### Error Middleware

Handles server errors and returns proper error responses.

 
# Stage 2

## Database Choice

For storing notifications, I would use a SQL database, preferably PostgreSQL.

Notifications have a proper structure. Each notification belongs to one student and has fields like type, message, read status, and time. SQL is suitable because it keeps data consistent and allows easy filtering, sorting, and updating.

  

## Database Schema

### Students Table

```sql
CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL
);
```

### Notification Type

```sql
CREATE TYPE notification_type AS ENUM (
    'Event',
    'Result',
    'Placement'
);
```

### Notifications Table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id BIGINT NOT NULL REFERENCES students(id),
    notification_type notification_type NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL
);
```

  

## Queries Based on Stage 1 APIs

### 1. Get All Notifications

```sql
SELECT *
FROM notifications
WHERE student_id = 1042
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;
```

### 2. Get Unread Notifications

```sql
SELECT *
FROM notifications
WHERE student_id = 1042
AND is_read = FALSE
ORDER BY created_at DESC;
```

### 3. Mark Notification As Read

```sql
UPDATE notifications
SET is_read = TRUE,
    read_at = CURRENT_TIMESTAMP
WHERE id = 'notification-id'
AND student_id = 1042;
```

### 4. Mark All Notifications As Read

```sql
UPDATE notifications
SET is_read = TRUE,
    read_at = CURRENT_TIMESTAMP
WHERE student_id = 1042
AND is_read = FALSE;
```

### 5. Delete Notification

```sql
DELETE FROM notifications
WHERE id = 'notification-id'
AND student_id = 1042;
```

### 6. Get Unread Count

```sql
SELECT COUNT(*) AS unread_count
FROM notifications
WHERE student_id = 1042
AND is_read = FALSE;
```

### 7. Create Notification

```sql
INSERT INTO notifications (
    student_id,
    notification_type,
    message
)
VALUES (
    1042,
    'Placement',
    'Advanced Micro Devices Inc. hiring'
);
```

  

## Problems When Data Increases

When notification data increases, these problems may come:

- Fetching notifications may become slow
- Sorting by time may take more cost
- Unread count query may run again and again
- Mark all as read may update many rows together
- Old notifications may increase table size

  

## Solutions

### 1. Indexing

Add index on commonly searched column
```sql
CREATE INDEX idx_notifications_student_read_time
ON notifications (student_id, is_read, created_at DESC);
```


### 2. Pagination



```sql
LIMIT 10 OFFSET 0;
```

### 3. Caching

Unread count can be stored in cache like Redis so the database is not hit every time.

### 4. Archiving

Old notifications can be moved to an archive table after some time.

### 5. Partitioning

If the table becomes very large, it can be partitioned by month or year using `created_at`.







# Stage 3

## Given Query is 

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

---

## Is The Query accurate?


Yes this query is correct because it fetches unread notification of a particular student and sorts them 


## Why Is The Query Slow?

This query  becomes slower because in this table contains millions of notifications

The database now contains:

- 50000 students
- 5000000 notifications

Without proper indexing the database may scan a large number of rows before finding matching notifications.

The query also performs sorting using `createdAt` which increases the time cost further.

Using `SELECT *` is another issue because it fetches all columns even if only a few are columns are required

---

## Improved Query

```sql
SELECT id, notification_type, message, createdAt
FROM notifications
WHERE student_id = 1042
AND is_read = FALSE
ORDER BY created_at DESC
LIMIT 20;
```

### Improvements Made

- Selected only required columns
- Added `LIMIT`
- Used descending order to get latest notifications first



## Recommended Index

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications (student_id, is_read, created_at DESC);
```

By using this index helps the database directly find unread notifications of a student without scanning the full table.



## Likely Computation Cost

### Without Index

The database may perform a full table scan.

Cost is almost:

```txt
O(n)
```

where `n` is total no of notifications.

---

### With Index

The database can directly search matching rows using the index.

Appx cost:

```txt
O(log n)
```

which is much faster.

---

## Should We Add Indexes On Every Column?

No, adding indexes on every column is not a good idea.

Too many indexes create problems such as:

- increased storage usage
- slower INSERT operations
- slower UPDATE operations
- slower DELETE operations
- extra maintenance 

Indexes should only be added on columns that are frequently used in:

- WHERE
- JOIN
- ORDER BY

For this system, useful columns are:

- student_id
- is_read
- created_at
- notification_type

---

## Query To Find Students Who Got Placement Notifications In Last 7 Days

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE notification_type = 'Placement'
AND created_at >= CURRENT_DATE - INTERVAL '7 days';
```

This query gives the name of all student who recieved the placement notification in the last 7 days

