import { Schema, model } from 'mongoose';
import { SUBSCRIPTION_PLAN_STATUS } from '../../constants/app.constant';

const userSubscriptionPlans = new Schema(
    {
        plan_name: { type: String, default: "" },
        duration_in_days: { type: Number, default: 1 },
        amount: { type: Number,  },
        apple_id: { type: String },
        google_id: { type: String, default:"" },
        
        status: { type: Number, default: SUBSCRIPTION_PLAN_STATUS.ACTIVE },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        id: false,
        versionKey: false,
        timestamps: true
    },

)

export default model('user_subscription_plans', userSubscriptionPlans)