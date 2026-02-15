import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchDashboard } from '../api/dashboard.api';
import {
  cancelEventRegistration,
  fetchEvents,
  registerForEvent,
} from '../api/events.api';
import { getErrorMessage } from '../api/http';
import EventCard from '../components/events/EventCard';
import { useAuth } from '../context/AuthContext';
import useDebouncedValue from '../hooks/useDebouncedValue';

const PAGE_SIZE = 9;

const parsePage = (rawPage) => {
  const page = Number(rawPage);
  if (Number.isNaN(page) || page < 1) {
    return 1;
  }
  return page;
};

const EventsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, isAuthenticated } = useAuth();
  const [eventsData, setEventsData] = useState({
    events: [],
    total: 0,
    page: 1,
    pages: 1,
  });
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionEventId, setActionEventId] = useState('');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebouncedValue(searchInput, 450);

  const filters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      location: searchParams.get('location') || '',
      startDate: searchParams.get('startDate') || '',
      endDate: searchParams.get('endDate') || '',
      page: parsePage(searchParams.get('page')),
    }),
    [searchParams]
  );

  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
  }, [searchParams]);

  const updateParams = (updates, resetPage = true) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });

    if (resetPage && !Object.prototype.hasOwnProperty.call(updates, 'page')) {
      nextParams.set('page', '1');
    }

    setSearchParams(nextParams);
  };

  useEffect(() => {
    if (debouncedSearch === (searchParams.get('search') || '')) {
      return;
    }
    updateParams({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    let shouldIgnore = false;

    const loadEvents = async () => {
      setLoadingEvents(true);
      setEventsError('');
      try {
        const payload = await fetchEvents(
          {
            search: filters.search || undefined,
            category: filters.category || undefined,
            location: filters.location || undefined,
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
            page: filters.page,
            limit: PAGE_SIZE,
          },
          token
        );

        if (shouldIgnore) {
          return;
        }

        setEventsData({
          events: payload.events || [],
          total: payload.total || 0,
          page: payload.page || filters.page,
          pages: payload.pages || 1,
        });
      } catch (error) {
        if (shouldIgnore) {
          return;
        }
        setEventsError(getErrorMessage(error, 'Failed to fetch events.'));
      } finally {
        if (!shouldIgnore) {
          setLoadingEvents(false);
        }
      }
    };

    loadEvents();

    return () => {
      shouldIgnore = true;
    };
  }, [
    filters.search,
    filters.category,
    filters.location,
    filters.startDate,
    filters.endDate,
    filters.page,
    token,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      setRegisteredEventIds(new Set());
      return;
    }

    let shouldIgnore = false;
    const loadRegisteredEvents = async () => {
      try {
        const dashboard = await fetchDashboard(token);
        const eventIds = [
          ...(dashboard.upcomingEvents || []),
          ...(dashboard.pastEvents || []),
        ].map((event) => event._id);

        if (!shouldIgnore) {
          setRegisteredEventIds(new Set(eventIds));
        }
      } catch {
        if (!shouldIgnore) {
          setRegisteredEventIds(new Set());
        }
      }
    };

    loadRegisteredEvents();
    return () => {
      shouldIgnore = true;
    };
  }, [isAuthenticated, token]);

  const categoryOptions = useMemo(() => {
    const values = new Set(eventsData.events.map((event) => event.category).filter(Boolean));
    if (filters.category) {
      values.add(filters.category);
    }
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [eventsData.events, filters.category]);

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

  const updateEventCount = (eventId, delta) => {
    setEventsData((prev) => ({
      ...prev,
      events: prev.events.map((event) =>
        event._id === eventId
          ? {
              ...event,
              registeredCount: Math.max((event.registeredCount || 0) + delta, 0),
            }
          : event
      ),
    }));
  };

  const handleRegister = async (event) => {
    if (!isAuthenticated) {
      handleLoginRequired();
      return;
    }

    setActionEventId(event._id);
    setActionError('');
    setActionSuccess('');

    try {
      await registerForEvent(event._id, token);
      setRegisteredEventIds((prev) => {
        const next = new Set(prev);
        next.add(event._id);
        return next;
      });
      updateEventCount(event._id, 1);
      setActionSuccess(`Registered for "${event.name}"`);
    } catch (error) {
      setActionError(getErrorMessage(error, 'Unable to register for event.'));
    } finally {
      setActionEventId('');
    }
  };

  const handleCancel = async (event) => {
    setActionEventId(event._id);
    setActionError('');
    setActionSuccess('');

    try {
      await cancelEventRegistration(event._id, token);
      setRegisteredEventIds((prev) => {
        const next = new Set(prev);
        next.delete(event._id);
        return next;
      });
      updateEventCount(event._id, -1);
      setActionSuccess(`Cancelled registration for "${event.name}"`);
    } catch (error) {
      setActionError(getErrorMessage(error, 'Unable to cancel registration.'));
    } finally {
      setActionEventId('');
    }
  };

  const totalPages = Math.max(eventsData.pages || 1, 1);

  return (
    <section className="page-stack">
      <header className="page-header">
        <h1>Discover Events</h1>
        <p>
          Browse, search, and filter events. Your filter state is preserved in the URL while
          navigating.
        </p>
      </header>

      <section className="panel filters-panel">
        <div className="filters-grid">
          <label className="field">
            <span>Search</span>
            <input
              type="text"
              placeholder="Search by name, organizer, location..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Category</span>
            <select
              value={filters.category}
              onChange={(event) => updateParams({ category: event.target.value })}
            >
              <option value="">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Location</span>
            <input
              type="text"
              value={filters.location}
              onChange={(event) => updateParams({ location: event.target.value })}
              placeholder="City or venue"
            />
          </label>

          <label className="field">
            <span>Start Date</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) => updateParams({ startDate: event.target.value })}
            />
          </label>

          <label className="field">
            <span>End Date</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) => updateParams({ endDate: event.target.value })}
            />
          </label>

          <div className="field field-actions">
            <span>Quick Actions</span>
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setSearchInput('');
                setSearchParams(new URLSearchParams());
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {actionError && <p className="feedback feedback-error">{actionError}</p>}
      {actionSuccess && <p className="feedback feedback-success">{actionSuccess}</p>}
      {eventsError && <p className="feedback feedback-error">{eventsError}</p>}

      {loadingEvents ? (
        <div className="panel loading">Loading events...</div>
      ) : eventsData.events.length === 0 ? (
        <div className="panel empty">No events found. Try a different filter set.</div>
      ) : (
        <div className="event-grid">
          {eventsData.events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              isAuthenticated={isAuthenticated}
              isRegistered={registeredEventIds.has(event._id)}
              onRegister={handleRegister}
              onCancel={handleCancel}
              onRequireLogin={handleLoginRequired}
              isBusy={actionEventId === event._id}
              detailsState={{ fromSearch: location.search }}
            />
          ))}
        </div>
      )}

      <footer className="pagination-bar">
        <p>
          Showing page {eventsData.page} of {totalPages} ({eventsData.total} total events)
        </p>
        <div className="pagination-actions">
          <button
            type="button"
            className="button button-outline"
            disabled={eventsData.page <= 1}
            onClick={() => updateParams({ page: eventsData.page - 1 }, false)}
          >
            Previous
          </button>
          <button
            type="button"
            className="button button-outline"
            disabled={eventsData.page >= totalPages}
            onClick={() => updateParams({ page: eventsData.page + 1 }, false)}
          >
            Next
          </button>
        </div>
      </footer>
    </section>
  );
};

export default EventsPage;
