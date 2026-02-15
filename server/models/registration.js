import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
    },
    {timestamps: true}
);

registrationSchema.index({user: 1, event: 1}, {unique: true});

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;