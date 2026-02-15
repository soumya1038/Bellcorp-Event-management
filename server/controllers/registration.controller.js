import mongoose from 'mongoose';
import Event from '../models/event.js';
import Registration from '../models/registration.js';

export const registerForEvent = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userId = req.user._id; // from auth middleware
    const eventId = req.params.id;

    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        $expr: { $lt: ['$registeredCount', '$capacity'] },
      },
      { $inc: { registeredCount: 1 } },
      { new: true, session }
    );

    if (!event) {
      throw new Error('EVENT_FULL_OR_NOT_FOUND');
    }

    await Registration.create(
      [
        {
          user: userId,
          event: eventId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Registered successfully',
      spotsLeft: event.capacity - event.registeredCount,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You are already registered for this event',
      });
    }

    if (error.message === 'EVENT_FULL_OR_NOT_FOUND') {
      return res.status(400).json({
        message: 'Event is full or does not exist',
      });
    }

    console.error('Atomic registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const cancelRegistration = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userId = req.user._id;
    const eventId = req.params.id;

    const registration = await Registration.findOneAndDelete(
      { user: userId, event: eventId },
      { session }
    );

    if (!registration) {
      throw new Error('NOT_REGISTERED');
    }

    await Event.findByIdAndUpdate(
      eventId,
      { $inc: { registeredCount: -1 } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.message === 'NOT_REGISTERED') {
      return res.status(404).json({
        message: 'You are not registered for this event',
      });
    }

    console.error('Cancel registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
