import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        organizer: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            type: String,
            required: true,
            trim: true,
        },

        date: {
            type: Date,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        capacity: {
            type: Number,
            required: true,
            min: 1,
        },

        category: {
            type: String,
            required: true,
            index: true, // Improves filtering performance
        },

        registeredCount: {
            type: Number,
            default: 0,
            min: 0,
        },

    },
    {
        timestamps: true,
    }
);

eventSchema.index({
    name: 'text',
    organizer: 'text',
    location: 'text',
    description: 'text',
});

const Event = mongoose.model('Event', eventSchema);

export default Event;