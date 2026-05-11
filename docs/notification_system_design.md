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

   

### With Index

The database can directly search matching rows using the index.

Appx cost:

```txt
O(log n)
```

which is much faster.

   

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

   

## Query To Find Students Who Got Placement Notifications In Last 7 Days

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE notification_type = 'Placement'
AND created_at >= CURRENT_DATE - INTERVAL '7 days';
```

This query gives the name of all student who recieved the placement notification in the last 7 days



# Stage 4

## Problem
Currently notifications are fetch on every page load for exery student.
This can overload the database and make the application slow.

   

## Suggested Improvements

## 1. Fetch Notifications Only When Needed

Instead of calling the notification API on every page load, the frontend should fetch notifications only when:

- the user opens the notification panel
- the user clicks the bell icon
- the user refreshes notifications manually
- a real-time notification event is received

### Tradeoff

This reduces unnecessary API calls, but notifications may not update instantly unless WebSocket is also used.

   

## 2. Use WebSocket For Real-Time Notifications

WebSocket should be used to send new notifications from the server to the logged-in user.

When a new notification is created, the backend can push it directly to the frontend.

### Tradeoff

WebSocket improves real-time experience, but it requires connection handling, reconnection logic, and more server resources.

   

## 3. Use Redis Cache

Frequently used data like unread count and recent notifications can be stored in Redis.

Example cache keys:

```txt
student:1042:unread_count
student:1042:recent_notifications
```

The API can first check Redis. If data is available, it can return from cache instead of querying the database.

### Tradeoff

Cache makes response faster, but cache data must be updated correctly when notifications are created or marked as read.

   

## 4. Use Pagination

The API should not return all notifications at once. It should return limited records.

Example:

```http
/api/v1/notifications?page=1&limit=10
```

### Tradeoff

Pagination reduces load, but frontend has to handle next page or infinite scrolling.

   

## 5. Maintain Unread Count Separately

Instead of running `COUNT(*)` every time, unread count can be stored separately.

Example table:

```sql
CREATE TABLE notification_summary (
    student_id BIGINT PRIMARY KEY,
    unread_count INT DEFAULT 0
);
```

When a new notification is added, increase `unread_count`.  
When notification is marked read, decrease `unread_count`.

### Tradeoff

This makes unread count very fast, but it must be updated carefully to avoid wrong count.

   

## 6. Use Database Indexing

Indexes should be used on fields that are used often in queries.

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications (student_id, is_read, created_at DESC);
```

### Tradeoff

Indexes make read queries faster, but insert and update operations become slightly slower.

   

## Final Suggested Approach

The best approach is to combine multiple techniques:

- Use WebSocket for new notifications
- Use Redis for unread count and recent notifications
- Fetch notifications only when user opens the notification panel
- Use pagination for notification list
- Use proper database indexes
- Store unread count separately

This will reduce database load and improve user experience.

# Stage 5

## Problems In Current Implementation

The current implementation has multiple issues:

- Notifications are sent one by one, so the process becomes very slow for 50,000 students.
- If the email API fails in the middle, some students may not receive notifications.
- Database saving and email sending are directly connected.
- The process is synchronous, so HR has to wait until all notifications are completed.

   

## Better Solution

A better approach is to use:

- message queue
- background workers
- retry mechanism

Instead of sending notifications directly inside the loop, the system should first store notifications and then process email sending separately in the background.

   

## Should DB Save And Email Sending Happen Together?

No.

Saving notifications in the database is important because it keeps a permanent record.

Email sending depends on external APIs and may fail due to:
- network issue
- timeout
- email service downtime

So first save notifications safely in DB, then process emails asynchronously.

   

## Improved Flow

1. HR clicks "Notify All"
2. Notifications are stored in database
3. Notification jobs are added to queue
4. Worker processes jobs in background
5. Emails and app notifications are sent
6. Failed jobs are retried automatically

   

## Revised Pseudocode

```python
function notify_all(student_ids, message):

    for student_id in student_ids:

        save_to_db(student_id, message)

        queue.push({
            "student_id": student_id,
            "message": message
        })
```

   

## Worker Process

```python
function worker(job):

    try:

        send_email(job.student_id, job.message)

        push_to_app(job.student_id, job.message)

    except Exception:

        retry_job(job)
```

   

## Advantages

- Faster processing
- Better scalability
- Failed emails can be retried
- Database remains consistent
- Better user experience

   

## Final Approach

The best solution is to:

- store notifications first
- use queues and workers
- send emails asynchronously
- retry failed jobs automatically

This makes the system reliable and scalable.




# Stage 6

## Priority Notification Approach

For Priority Inbox, I used a scoring method. Placement notifications get the highest weight, Result notifications get medium weight, and Event notifications get the lowest weight.

Priority weights used:

- Placement = 3
- Result = 2
- Event = 1

After type weight, recent notifications are given higher priority using timestamp.

The code fetches notifications from the given API, calculates priority score, sorts the list, and displays the top 10 notifications.

## Maintaining Top 10 Efficiently

If new notifications keep coming, sorting the whole list every time is not efficient. A better way is to maintain a min-heap of size 10.

For every new notification:

- calculate its score
- compare it with the lowest score in heap
- if new score is higher, replace the lowest item
- otherwise ignore it

This keeps top 10 updated efficiently.