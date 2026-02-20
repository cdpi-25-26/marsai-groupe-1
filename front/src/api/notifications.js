import instance from "./config.js";

async function getNotifications(unreadOnly = false) {
  return await instance.get("notifications", {
    params: { unreadOnly: unreadOnly ? "true" : "false" },
  });
}

async function getUnreadCount() {
  return await instance.get("notifications/unread-count");
}

async function markAsRead(notificationId) {
  return await instance.put(`notifications/${notificationId}/read`);
}

async function markAllAsRead() {
  return await instance.put("notifications/read-all");
}

async function deleteNotification(notificationId) {
  return await instance.delete(`notifications/${notificationId}`);
}

export { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification };
