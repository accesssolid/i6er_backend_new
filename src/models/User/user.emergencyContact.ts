import mongoose, { Schema, model } from 'mongoose';

const ContactSchema = new Schema(
    {
        user_id: { type: mongoose.Types.ObjectId, ref: 'users' },
        name: { type: String },
        phone: { type: String },
        email: { type: String },
    },
    {
        timestamps: true,
        versionKey: false,
    },

)

ContactSchema.index({ user_id: 1 });

export default model('emergency_contacts', ContactSchema)