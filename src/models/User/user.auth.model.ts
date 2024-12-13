import { Schema, model } from 'mongoose';
import { ROLE, USER_STATUS } from '../../constants/app.constant';

const UserSchema = new Schema(
    {
        first_name: { type: String, default: "" },
        last_name: { type: String, default: "" },
        display_name: { type: String, default: "" },
        email: { type: String },
        password: { type: String, default: null },
        profile_pic: { type: String, default: "" },
        blood_group: { type: String, default: "" },
        user_type: { type: Number, default: ROLE.USER },
        otp: { type: Number, default: null },
        dob: { type: Number, default: null },
        settings: {
            display_dob: { type: Boolean, default: false },
            send_sms: { type: Boolean, default: true },
            allow_gps: { type: Boolean, default: true },
            allow_multi_contact: { type: Boolean, default: true },
            dark_mode: { type: Boolean, default: true },
        },
        is_verified: { type: Boolean, default: true },
        status: { type: Number, default: USER_STATUS.ACTIVE },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        id: false,
        versionKey: false,
        timestamps: true
    },

)

export default model('user', UserSchema)