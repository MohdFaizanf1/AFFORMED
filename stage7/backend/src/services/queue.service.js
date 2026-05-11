// Conceptual queue service — inspired by BullMQ / RabbitMQ patterns
// In production, replace the in-memory array with a real queue (BullMQ + Redis)

const pendingQueue = [];

// simulate adding a notification job to the queue
const queueNotification = async (notificationData) => {
  const job = {
    id: `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    payload: notificationData,
    status: "pending",
    createdAt: new Date(),
  };

  pendingQueue.push(job);

  // in real impl: await queue.add('send-notification', notificationData)
  console.log(`[Queue] Job queued → ${job.id} | type: ${notificationData.type}`);

  return job;
};

// simulate processing the next job in the queue
const processNotification = async () => {
  if (pendingQueue.length === 0) {
    return { message: "Queue is empty" };
  }

  const job = pendingQueue.shift(); // FIFO
  job.status = "processing";

  // simulate async processing delay (would be actual DB write or push notification)
  await new Promise((resolve) => setTimeout(resolve, 100));

  job.status = "completed";
  job.processedAt = new Date();

  // in real impl: worker.process('send-notification', async (job) => { ... })
  console.log(`[Queue] Job processed → ${job.id}`);

  return job;
};

const getQueueLength = () => pendingQueue.length;

module.exports = { queueNotification, processNotification, getQueueLength };
