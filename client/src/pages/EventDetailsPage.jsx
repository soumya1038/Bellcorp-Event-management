import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchDashboard } from '../api/dashboard.api';
import {
  cancelEventRegistration,
  fetchEventById,
  registerForEvent,
} from '../api/events.api';
import { getErrorMessage } from '../api/http';
import { useAuth } from '../context/AuthContext';

const formatEventDate = (dateValue) => {
  return new Date(dateValue).toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isAuthenticated } = useAuth();
  const [eventData, setEventData] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const returnToEventsPath = useMemo(() => {
    return `/events${location.state?.fromSearch || ''}`;
  }, [location.state]);

  useEffect(() => {
    let shouldIgnore = false;

    const loadEventData = async () => {
      setLoading(true);
      setErrorMessage('');
      setActionMessage('');

      try {
        const [event, dashboard] = await Promise.all([
          fetchEventById(eventId, token),
          isAuthenticated ? fetchDashboard(token) : Promise.resolve(null),
        ]);

        if (shouldIgnore) {
          return;
        }

        setEventData(event);

        if (dashboard) {
          const registeredIds = new Set(
            [...(dashboard.upcomingEvents || []), ...(dashboard.pastEvents || [])].map(
              (registeredEvent) => registeredEvent._id
            )
          );
          setIsRegistered(registeredIds.has(eventId));
        } else {
          setIsRegistered(false);
        }
      } catch (error) {
        if (shouldIgnore) {
          return;
        }
        setErrorMessage(getErrorMessage(error, 'Unable to load event details.'));
      } finally {
        if (!shouldIgnore) {
          setLoading(false);
        }
      }
    };

    loadEventData();

    return () => {
      shouldIgnore = true;
    };
  }, [eventId, token, isAuthenticated]);

  const handleLoginRequired = () => {
    navigate('/login', {
      state: {
        from: {
          pathname: location.pathname,
          search: location.search,
        },
      },
    });
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      handleLoginRequired();
      return;
    }

    setIsActionLoading(true);
    setErrorMessage('');
    setActionMessage('');
    try {
      await registerForEvent(eventId, token);
      setIsRegistered(true);
      setEventData((prev) => ({
        ...prev,
        registeredCount: (prev?.registeredCount || 0) + 1,
      }));
      setActionMessage('Registered successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to register for this event.'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsActionLoading(true);
    setErrorMessage('');
    setActionMessage('');
    try {
      await cancelEventRegistration(eventId, token);
      setIsRegistered(false);
      setEventData((prev) => ({
        ...prev,
        registeredCount: Math.max((prev?.registeredCount || 0) - 1, 0),
      }));
      setActionMessage('Registration cancelled successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to cancel registration.'));
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return <div className="panel loading">Loading event details...</div>;
  }

  if (errorMessage && !eventData) {
    return (
      <section className="page-stack">
        <p className="feedback feedback-error">{errorMessage}</p>
        <Link to={returnToEventsPath} className="button button-outline">
          Back to Events
        </Link>
      </section>
    );
  }

  const spotsLeft = Math.max(eventData.capacity - eventData.registeredCount, 0);
  const isPastEvent = new Date(eventData.date) < new Date();

  return (
    <section className="page-stack">
      <Link to={returnToEventsPath} className="button button-link">
        ← Back to Events
      </Link>

      <article className="panel event-detail">
        <p className="event-category">{eventData.category}</p>
        <h1>{eventData.name}</h1>
        <p className="event-meta">Organized by {eventData.organizer}</p>
        <p className="event-meta">{eventData.location}</p>
        <p className="event-meta">{formatEventDate(eventData.date)}</p>
        <p className="event-description">{eventData.description}</p>
        <p className="event-seats">
          Seats left: <strong>{spotsLeft}</strong> / {eventData.capacity}
        </p>

        <div className="event-actions">
          {!isAuthenticated ? (
            <button type="button" className="button button-primary" onClick={handleLoginRequired}>
              Login to Register
            </button>
          ) : isRegistered ? (
            <button
              type="button"
              className="button button-outline"
              disabled={isActionLoading}
              onClick={handleCancel}
            >
              {isActionLoading ? 'Updating...' : 'Cancel Registration'}
            </button>
          ) : isPastEvent ? (
            <button type="button" className="button button-disabled" disabled>
              Event Ended
            </button>
          ) : spotsLeft === 0 ? (
            <button type="button" className="button button-disabled" disabled>
              Sold Out
            </button>
          ) : (
            <button
              type="button"
              className="button button-primary"
              disabled={isActionLoading}
              onClick={handleRegister}
            >
              {isActionLoading ? 'Updating...' : 'Register'}
            </button>
          )}
        </div>
      </article>

      {errorMessage && <p className="feedback feedback-error">{errorMessage}</p>}
      {actionMessage && <p className="feedback feedback-success">{actionMessage}</p>}
    </section>
  );
};

export default EventDetailsPage;
