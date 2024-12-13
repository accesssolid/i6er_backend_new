import mongoose, { Schema, model } from 'mongoose';

const AllergiesSchema = new Schema(
    {
        user_id: { type: mongoose.Types.ObjectId, ref: 'users' },
        name: { type: String },
    },
    {
        timestamps: true,
        versionKey: false,
    },

)

AllergiesSchema.index({ user_id: 1 });

export default model('allergies', AllergiesSchema)