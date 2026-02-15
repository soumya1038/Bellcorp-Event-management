import React from 'react';
import { Link } from 'react-router-dom';

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

const EventCard = ({
  event,
  isAuthenticated,
  isRegistered,
  onRegister,
  onCancel,
  onRequireLogin,
  detailsState,
  isBusy = false,
}) => {
  const spotsLeft = Math.max(event.capacity - event.registeredCount, 0);
  const isPastEvent = new Date(event.date) < new Date();

  let actionButton = null;

  if (isPastEvent) {
    actionButton = (
      <button type="button" className="button button-disabled" disabled>
        Event Ended
      </button>
    );
  } else if (!isAuthenticated) {
    actionButton = (
      <button
        type="button"
        className="button button-primary"
        onClick={onRequireLogin}
        disabled={isBusy}
      >
        Login to Register
      </button>
    );
  } else if (isRegistered) {
    actionButton = (
      <button
        type="button"
        className="button button-outline"
        onClick={() => onCancel(event)}
        disabled={isBusy}
      >
        {isBusy ? 'Updating...' : 'Cancel Registration'}
      </button>
    );
  } else if (spotsLeft === 0) {
    actionButton = (
      <button type="button" className="button button-disabled" disabled>
        Sold Out
      </button>
    );
  } else {
    actionButton = (
      <button
        type="button"
        className="button button-primary"
        onClick={() => onRegister(event)}
        disabled={isBusy}
      >
        {isBusy ? 'Updating...' : 'Register'}
      </button>
    );
  }

  return (
    <article className="event-card">
      <p className="event-category">{event.category}</p>
      <h3 className="event-title">{event.name}</h3>
      <p className="event-meta">By {event.organizer}</p>
      <p className="event-meta">{event.location}</p>
      <p className="event-meta">{formatEventDate(event.date)}</p>
      <p className="event-description">{event.description}</p>
      <p className="event-seats">
        Seats left: <strong>{spotsLeft}</strong> / {event.capacity}
      </p>

      <div className="event-actions">
        {actionButton}
        <Link
          to={`/event/${event._id}`}
          state={detailsState}
          className="button button-link"
        >
          View Details
        </Link>
      </div>
    </article>
  );
};

export default EventCard;
