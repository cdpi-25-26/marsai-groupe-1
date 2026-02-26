import instance from "./config.js";

export const fetchEvents = () =>
  instance.get("/events");

export const registerForEvent = (eventId, ticketType) =>
  instance.post(`/events/${eventId}/register`, { ticketType });

export const fetchMyRegistrations = () =>
  instance.get("/events/my-registrations");

export const scanQrToken = (qrToken) =>
  instance.post(`/events/scan/${qrToken}`);

export const fetchEventRegistrations = (eventId) =>
  instance.get(`/events/${eventId}/registrations`);

export const fetchScanHistory = () =>
  instance.get("/events/scan-history");
