import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../api/dashboard.api';
import { cancelEventRegistration } from '../api/events.api';
import { getErrorMessage } from '../api/http';
import { useAuth } from '../context/AuthContext';

const formatEventDate = (dateValue) => {
  return new Date(dateValue).toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const DashboardPage = () => {
  const { token, user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalRegistered: 0,
    upcomingEvents: [],
    pastEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionEventId, setActionEventId] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await fetchDashboard(token);
      setDashboardData({
        totalRegistered: data.totalRegistered || 0,
        upcomingEvents: data.upcomingEvents || [],
        pastEvents: data.pastEvents || [],
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to load dashboard data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const upcomingCount = useMemo(
    () => dashboardData.upcomingEvents.length,
    [dashboardData.upcomingEvents]
  );
  const pastCount = useMemo(() => dashboardData.pastEvents.length, [dashboardData.pastEvents]);

  const handleCancelRegistration = async (event) => {
    setActionEventId(event._id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await cancelEventRegistration(event._id, token);
      setDashboardData((prev) => ({
        ...prev,
        totalRegistered: Math.max(prev.totalRegistered - 1, 0),
        upcomingEvents: prev.upcomingEvents.filter((item) => item._id !== event._id),
        pastEvents: prev.pastEvents.filter((item) => item._id !== event._id),
      }));
      setSuccessMessage(`Cancelled registration for "${event.name}"`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to cancel registration.'));
    } finally {
      setActionEventId('');
    }
  };

  if (loading) {
    return <div className="panel loading">Loading dashboard...</div>;
  }

  return (
    <section className="page-stack">
      <header className="page-header dashboard-header">
        <div>
          <h1>My Dashboard</h1>
          <p>Track your registered events, upcoming schedule, and history.</p>
        </div>
        {user?.isCreator && (
          <Link to="/events/create" className="button button-primary">
            Add New Event
          </Link>
        )}
      </header>

      <section className="stats-grid">
        <article className="panel stat-card">
          <p>Total Registrations</p>
          <h2>{dashboardData.totalRegistered}</h2>
        </article>
        <article className="panel stat-card">
          <p>Upcoming Events</p>
          <h2>{upcomingCount}</h2>
        </article>
        <article className="panel stat-card">
          <p>Past Events</p>
          <h2>{pastCount}</h2>
        </article>
      </section>

      {errorMessage && <p className="feedback feedback-error">{errorMessage}</p>}
      {successMessage && <p className="feedback feedback-success">{successMessage}</p>}

      <section className="panel">
        <div className="section-title">
          <h2>Upcoming Events</h2>
        </div>
        {dashboardData.upcomingEvents.length === 0 ? (
          <p className="empty-inline">
            No upcoming events. <Link to="/events">Explore events</Link>
          </p>
        ) : (
          <div className="table-wrap">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Seats Left</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.upcomingEvents.map((event) => (
                  <tr key={event._id}>
                    <td>{event.name}</td>
                    <td>{formatEventDate(event.date)}</td>
                    <td>{event.location}</td>
                    <td>{event.spotsLeft}</td>
                    <td>
                      <button
                        type="button"
                        className="button button-outline button-small"
                        disabled={actionEventId === event._id}
                        onClick={() => handleCancelRegistration(event)}
                      >
                        {actionEventId === event._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>Past Events</h2>
        </div>
        {dashboardData.pastEvents.length === 0 ? (
          <p className="empty-inline">No past event history yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.pastEvents.map((event) => (
                  <tr key={event._id}>
                    <td>{event.name}</td>
                    <td>{formatEventDate(event.date)}</td>
                    <td>{event.location}</td>
                    <td>{event.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
};

export default DashboardPage;
