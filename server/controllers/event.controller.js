import Event from '../models/event.js';
import Registration from '../models/registration.js';

export const createEvent = async (req, res) => {
    try {
        const {
            name,
            organizer,
            location,
            date,
            description,
            capacity,
            category,
        } = req.body;

        if (
            !name ||
            !location ||
            !date ||
            !description ||
            !capacity ||
            !category
        ) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const parsedCapacity = Number(capacity);
        if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
            return res.status(400).json({ message: 'Capacity must be a positive integer' });
        }

        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: 'Invalid event date' });
        }

        const event = await Event.create({
            name,
            organizer: organizer?.trim() || req.user.name,
            location,
            date: parsedDate,
            description,
            capacity: parsedCapacity,
            category,
        });

        res.status(201).json({
            message: 'Event created successfully',
            event,
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getEvents = async (req, res) => {
    try {
        const {
            search,
            category,
            location,
            startDate,
            endDate,
            page = 1,
            limit = 10,
        } = req.query;

        const query = {};

        if (search) {
            query.$text = { $search: search };
        }

        if (category) {
            query.category = category;
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const sortOption = search
            ? { score: { $meta: 'textScore' }, date: 1 }
            : { date: 1 };

        const events = await Event.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        const total = await Event.countDocuments(query);

        let registeredEventIds = new Set();
        if (req.user) {
            const registrations = await Registration.find({
                user: req.user._id,
                event: { $in: events.map((e) => e._id) },
            }).select('event');

            registeredEventIds = new Set(
                registrations.map((r) => r.event.toString())
            )
        }

        const enrichedEvebts = events.map(event => ({
            ...event.toObject(),
            isRegistered: registeredEventIds.has(event._id.toString()),
            spotsLeft: event.capacity - event.registeredCount,
        }));

        res.status(200).json({
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            events,
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({message: 'Event not found'});
        }

        res.status(200).json(event);
    } catch (error) {
        console.error('Get event by id error:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}
