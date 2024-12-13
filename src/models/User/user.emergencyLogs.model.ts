import mongoose, { Schema, model } from 'mongoose';

const EmergencyLogsSchema = new Schema(
    {
        user_id: { type: mongoose.Types.ObjectId, ref: 'users' },
        contact_id: { type: mongoose.Types.ObjectId, ref: 'emergency_contacts' },
        location: {
            name: { type: String, default: '' },
            type: { type: String, enum: ["Point"], default: 'Point' },
            coordinates: { type: [Number, Number], default: [0, 0] }, // coordinates
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },

)

EmergencyLogsSchema.index({ contact_id: 1 });

export default model('emergency_logs', EmergencyLogsSchema)