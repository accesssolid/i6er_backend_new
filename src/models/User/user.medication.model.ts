import mongoose, { Schema, model } from 'mongoose';

const MedicationSchema = new Schema(
    {
        user_id: { type: mongoose.Types.ObjectId, ref: 'users' },
        name: { type: String },
        dose: { type: String },
        reason: { type: String },
    },
    {
        timestamps: true,
        versionKey: false,
    },

)

MedicationSchema.index({ user_id: 1 });

export default model('medications', MedicationSchema)