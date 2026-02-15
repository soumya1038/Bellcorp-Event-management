import Registration from "../models/registration.js";

export const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();


        const registrations = await Registration.find({user: userId}).populate({
            path: 'event',
            select: 'name organizer location date capacity registeredCount category',
        }).sort({ 'event.date': 1 });

        const upcommingEvents = [];
        const pastEvents = [];

        registrations.forEach(reg => {
            if (!reg.event) return;

            const eventData = {
                ...reg.event.toObject(),
                spotsLeft: reg.event.capacity - reg.event.registeredCount,
                registeredAt: reg.createdAt,
            };

            if (reg.event.date >= now) {
                upcommingEvents.push(eventData);
            } else {
                pastEvents.push(eventData);
            }
        });

        res.status(200).json({
            totalRegistered: registrations.length,
            upcommingCount: upcommingEvents.length,
            pastCount: pastEvents.length,
            upcommingEvents,
            pastEvents,
        });
    } catch (error) {
        console.error('Dashboard fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};