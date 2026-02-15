import { http, getAuthHeaders } from './http';

const normalizeEvents = (events = []) => {
  return events.map((event) => ({
    ...event,
    spotsLeft: Math.max(event.capacity - (event.registeredCount || 0), 0),
  }));
};

export const fetchEvents = async (filters = {}, token = '') => {
  const response = await http.get('/events', {
    params: filters,
    headers: getAuthHeaders(token),
  });

  const payload = response.data || {};

  return {
    ...payload,
    events: normalizeEvents(payload.events),
  };
};

export const fetchEventById = async (eventId, token = '') => {
  const response = await http.get(`/events/${eventId}`, {
    headers: getAuthHeaders(token),
  });

  const event = response.data || {};
  return {
    ...event,
    spotsLeft: Math.max(event.capacity - (event.registeredCount || 0), 0),
  };
};

export const registerForEvent = async (eventId, token) => {
  const response = await http.post(
    `/events/${eventId}/register`,
    {},
    { headers: getAuthHeaders(token) }
  );
  return response.data;
};

export const cancelEventRegistration = async (eventId, token) => {
  const response = await http.delete(`/events/${eventId}/register`, {
    headers: getAuthHeaders(token),
  });
  return response.data;
};

export const createEvent = async (payload, token) => {
  const response = await http.post('/events', payload, {
    headers: getAuthHeaders(token),
  });
  return response.data;
};
