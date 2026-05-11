const notifications = [
  {
    ID: "1",
    Type: "Placement",
    Message: "CSX Corporation hiring",
    Timestamp: "2026-04-22 17:51:18",
  },
  {
    ID: "2",
    Type: "Result",
    Message: "Mid-sem result declared",
    Timestamp: "2026-04-22 17:51:30",
  },
  {
    ID: "3",
    Type: "Event",
    Message: "Farewell Event",
    Timestamp: "2026-04-22 17:50:00",
  },
  {
    ID: "4",
    Type: "Placement",
    Message: "AMD hiring",
    Timestamp: "2026-04-22 17:55:00",
  },
  {
    ID: "5",
    Type: "Result",
    Message: "Project review",
    Timestamp: "2026-04-22 17:40:00",
  },
];

const priorityWeight = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function getScore(notification) {
  const typeScore = priorityWeight[notification.Type] || 0;
  const timeScore = new Date(notification.Timestamp).getTime();

  return typeScore * 10000000000000 + timeScore;
}

function getTop10Notifications(notifications) {
  return notifications
    .sort((a, b) => getScore(b) - getScore(a))
    .slice(0, 10);
}

function printNotifications(notifications) {
  console.log("\nTop 10 Priority Notifications\n");

  notifications.forEach((notification, index) => {
    console.log(`${index + 1}. ${notification.Type}`);
    console.log(`Message: ${notification.Message}`);
    console.log(`Time: ${notification.Timestamp}`);
    console.log(`ID: ${notification.ID}`);
    console.log("-----------------------------");
  });
}

const top10 = getTop10Notifications(notifications);

printNotifications(top10);