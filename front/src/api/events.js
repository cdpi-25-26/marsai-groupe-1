import instance from "./config.js";

async function getEvents() {
  return await instance.get("events");
}

async function getEventById(id) {
  return await instance.get(`events/${id}`);
}

async function createEvent(eventData) {
  return await instance.post("events", eventData);
}

async function updateEvent(id, eventData) {
  return await instance.put(`events/${id}`, eventData);
}

async function deleteEvent(id) {
  return await instance.delete(`events/${id}`);
}

export { getEvents, getEventById, createEvent, updateEvent, deleteEvent };

// --- Réservation / QR ---
export const fetchEvents = () => instance.get("/events");
export const registerForEvent = (eventId, ticketType) =>
  instance.post(`/events/${eventId}/register`, { ticketType });
export const fetchMyRegistrations = () => instance.get("/events/my-registrations");
export const scanQrToken = (qrToken) => instance.post(`/events/scan/${qrToken}`);
export const fetchEventRegistrations = (eventId) =>
  instance.get(`/events/${eventId}/registrations`);
export const fetchScanHistory = () => instance.get("/events/scan-history");
