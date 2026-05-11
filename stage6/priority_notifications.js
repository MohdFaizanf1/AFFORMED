const API_URL = "http://4.224.186.213/evaluation-service/notifications";

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
    .filter((notification) => notification.Type && notification.Timestamp)
    .sort((a, b) => getScore(b) - getScore(a))
    .slice(0, 10);
}

function printNotifications(notifications) {
  console.log("\nTop 10 Priority Notifications\n");

  if (notifications.length === 0) {
    console.log("No notifications found.");
    return;
  }

  notifications.forEach((notification, index) => {
    console.log(`${index + 1}. ${notification.Type}`);
    console.log(`Message: ${notification.Message}`);
    console.log(`Time: ${notification.Timestamp}`);
    console.log(`ID: ${notification.ID}`);
    console.log("-----------------------------");
  });
}

async function main() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`API failed with status ${response.status}`);
    }

    const data = await response.json();
    const notifications = data.notifications || [];

    const top10 = getTop10Notifications(notifications);
    printNotifications(top10);
  } catch (error) {
    console.log("Error:", error.message);
    console.log("The API may be protected or temporarily unavailable.");
  }
}

main();