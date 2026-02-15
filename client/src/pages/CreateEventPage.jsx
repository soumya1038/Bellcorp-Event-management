import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api/events.api';
import { getErrorMessage } from '../api/http';
import { useAuth } from '../context/AuthContext';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    organizer: user?.name || '',
    location: '',
    date: '',
    description: '',
    capacity: '',
    category: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const capacityValue = Number(formData.capacity);
    if (!Number.isInteger(capacityValue) || capacityValue < 1) {
      setErrorMessage('Capacity must be a positive integer.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createEvent(
        {
          ...formData,
          capacity: capacityValue,
          date: new Date(formData.date).toISOString(),
        },
        token
      );

      setSuccessMessage('Event created successfully. Redirecting...');
      setTimeout(() => {
        navigate(`/event/${response.event._id}`);
      }, 800);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to create event.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-stack">
      <header className="page-header">
        <h1>Create Event</h1>
        <p>Creator-only panel to publish new events.</p>
      </header>

      <section className="panel form-panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Event Name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Organizer</span>
            <input
              type="text"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Location</span>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Date and Time</span>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Category</span>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Capacity</span>
            <input
              type="number"
              min="1"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field field-full">
            <span>Description</span>
            <textarea
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </label>

          {errorMessage && <p className="feedback feedback-error">{errorMessage}</p>}
          {successMessage && <p className="feedback feedback-success">{successMessage}</p>}

          <button type="submit" className="button button-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </section>
    </section>
  );
};

export default CreateEventPage;
