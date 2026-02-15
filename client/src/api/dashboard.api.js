import { http, getAuthHeaders } from './http';

const normalizeEvents = (events = []) => {
  return events.map((event) => ({
    ...event,
    spotsLeft: Math.max(event.capacity - (event.registeredCount || 0), 0),
  }));
};

export const fetchDashboard = async (token) => {
  const response = await http.get('/dashboard', {
    headers: getAuthHeaders(token),
  });

  const data = response.data || {};
  const upcomingEvents = data.upcomingEvents || data.upcommingEvents || [];
  const pastEvents = data.pastEvents || [];

  return {
    ...data,
    upcomingEvents: normalizeEvents(upcomingEvents),
    pastEvents: normalizeEvents(pastEvents),
  };
};
