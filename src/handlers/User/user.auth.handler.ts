import ejs from 'ejs'
import path from 'path'
import moment from "moment";
import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, findAll, createOne, findByIdAndUpdate, findOneAndUpdate, findAndUpdatePushOrSet, insertMany } from "../../helpers/db.helpers";
import { decodeToken, generateJwtToken } from "../../utils/auth.util";
import * as commonHelper from "../../helpers/common.helper";
import userModel from "../../models/User/user.auth.model";
import { APP, ROLE, USER_STATUS } from '../../constants/app.constant';
import services from '../../services';
import responseMessage from '../../constants/ResponseMessage'
import statusCodes from '../../constants/statusCodes'
import userAllergiesModel from '../../models/User/user.allergies.model';
import userMedicationModel from '../../models/User/user.medication.model';
import userEmergencyContact from '../../models/User/user.emergencyContact';

const UserAuthHandler = {

    login: async (data: any): Promise<ApiResponse> => {
        const { email, password } = data;
        console.log(email, "email")

        const exists = await findOne(userModel, { email, status: { $ne: USER_STATUS.DELETED } }, { otp: 0 });
        console.log(exists, "existss")
        if (!exists.status) {
            return showResponse(false, responseMessage.users.not_registered, null, statusCodes.API_ERROR)
        }

        if (exists?.data?.status == USER_STATUS.DEACTIVATED) {
            return showResponse(false, responseMessage.middleware.deactivated_account, null, statusCodes.API_ERROR);
        }

        const isValid = await commonHelper.verifyBycryptHash(password, exists.data.password);
        if (!isValid) {
            return showResponse(false, responseMessage.common.password_incorrect, null, statusCodes.API_ERROR)
        }

        const token = await generateJwtToken(exists.data._id, { user_type: 'user', type: "access", role: exists?.data?.user_type }, APP.ACCESS_EXPIRY)
        delete exists.data.password
        const refresh_token = await generateJwtToken(exists.data._id, { user_type: 'user', type: "access", role: exists?.data?.user_type }, APP.REFRESH_EXPIRY)

        return showResponse(true, responseMessage.users.login_success, { ...exists.data, token, refresh_token }, statusCodes.SUCCESS)

    },


    register: async (data: any, profile_pic: any): Promise<ApiResponse> => {
        const { email, password } = data;
        // check if user exists
        const exists = await findOne(userModel, { email, status: { $ne: USER_STATUS.DELETED } });
        if (exists.status) {
            return showResponse(false, responseMessage.common.email_already, null, statusCodes.API_ERROR)
        }

        const hashed = await commonHelper.bycrptPasswordHash(password);
        data.password = hashed

        const userRef = new userModel(data)
        const result = await createOne(userRef)

        if (!result.status) {
            return showResponse(false, responseMessage.common.error_while_create_acc, null, statusCodes.API_ERROR)
        }
        //jkdsd
        //after successfull registration of the user save allergies medications and emergency contacts as well
        // const allergiesPayload = allergies?.map((all: any) => { return { ...all, user_id: result?.data?._id } })
        // const medicationsPayload = medications?.map((medic: any) => { return { ...medic, user_id: result?.data?._id } })
        // const emergencyContactsPayload = emergency_contacts?.map((contac: any) => { return { ...contac, user_id: result?.data?._id } })

        // const saveAllergies = await insertMany(userAllergiesModel, allergiesPayload)
        // if (!saveAllergies.status) {
        //     return showResponse(false, responseMessage.users.register_error, {}, statusCodes.API_ERROR)
        // }
        // const saveMedications = await insertMany(userMedicationModel, medicationsPayload)
        // if (!saveMedications.status) {
        //     return showResponse(false, responseMessage.users.register_error, {}, statusCodes.API_ERROR)
        // }
        // const saveEmergencyContacts = await insertMany(userEmergencyContact, emergencyContactsPayload)
        // if (!saveEmergencyContacts.status) {
        //     return showResponse(false, responseMessage.users.register_error, {}, statusCodes.API_ERROR)
        // }

        delete result?.data.password

        const token = await generateJwtToken(result.data?._id, { user_type: 'user', type: "access", role: result?.data?.user_type }, APP.ACCESS_EXPIRY)
        const refresh_token = await generateJwtToken(result.data?._id, { user_type: 'user', type: "access", role: result?.data?.user_type }, APP.REFRESH_EXPIRY)

        return showResponse(true, responseMessage.users.register_success, { token, refresh_token }, statusCodes.SUCCESS)

    },//ends

    forgotPassword: async (data: any): Promise<ApiResponse> => {
        const { email } = data;
        // check if exists
        const exists = await findOne(userModel, { email, status: { $ne: USER_STATUS.DELETED } });
        if (!exists.status) {
            return showResponse(false, responseMessage.users.not_registered, null, statusCodes.API_ERROR)
        }

        const otp = commonHelper.generateOtp();
        const email_payload = { project_name: APP.PROJECT_NAME, user_name: exists?.data?.first_name, cidLogo: 'unique@Logo', otp }
        const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'forgotPassword.ejs'), email_payload);
        const logoPath = path.join(process.cwd(), './public', 'logo.png');

        const to = `${exists?.data?.email}`
        const subject = `Forgot Password`

        const attachments = [
            {
                filename: 'logo.png',
                path: logoPath,
                cid: 'unique@Logo',
            }
        ]

        const forgotPassMail = await services.emailService.nodemail(to, subject, template, attachments)
        if (!forgotPassMail.status) {
            return showResponse(false, responseMessage.users.forgot_password_email_error, null, statusCodes.API_ERROR)

        }

        await findByIdAndUpdate(userModel, { otp }, exists?.data?._id);
        return showResponse(true, responseMessage.users.otp_send, null, statusCodes.SUCCESS);

    },

    uploadFile: async (data: any): Promise<ApiResponse> => {
        const { file } = data;

        const s3Upload = await services.awsService.uploadFileToS3([file])
        if (!s3Upload.status) {
            return showResponse(false, responseMessage?.common.file_upload_error, {}, statusCodes.FILE_UPLOAD_ERROR);
        }

        return showResponse(true, responseMessage.common.file_upload_success, s3Upload?.data, statusCodes.SUCCESS)
    },

    resetPassword: async (data: any): Promise<ApiResponse> => {
        const { email, new_password, otp } = data;
        const queryObject = { email, status: { $ne: USER_STATUS.DELETED } }

        const result = await findOne(userModel, queryObject);
        if (!result.status) {
            return showResponse(false, `${responseMessage.users.invalid_user} or email`, null, statusCodes.API_ERROR);
        }

        if (result.data?.otp !== Number(otp)) {
            return showResponse(false, responseMessage.users.invalid_otp, null, statusCodes.API_ERROR);
        }

        const hashed = await commonHelper.bycrptPasswordHash(new_password)

        const updateObj = {
            otp: '',
            password: hashed,
        }

        const updated = await findByIdAndUpdate(userModel, updateObj, result?.data?._id)
        if (!updated.status) {
            return showResponse(false, responseMessage.users.password_reset_error, null, statusCodes.API_ERROR)
        }
        return showResponse(true, responseMessage.users.password_reset_success, null, statusCodes.SUCCESS)

    },

    verifyOtp: async (data: any): Promise<ApiResponse> => {
        const { email, otp } = data;

        const queryObject = { email, otp, status: { $ne: USER_STATUS.DELETED } }

        const findUser = await findOne(userModel, queryObject)
        if (findUser.status) {
            await findOneAndUpdate(userModel, queryObject, { is_verified: true })
            return showResponse(true, responseMessage.users.otp_verify_success, null, statusCodes.SUCCESS);
        }

        return showResponse(false, responseMessage.users.invalid_otp, null, statusCodes.API_ERROR);

    },
    //ques
    resendOtp: async (data: any): Promise<ApiResponse> => {
        const { email } = data;
        const queryObject = { email, status: { $ne: USER_STATUS.DELETED } }

        const result = await findOne(userModel, queryObject);
        if (!result.status) {
            return showResponse(false, responseMessage.users.invalid_email, null, statusCodes.API_ERROR);
        }

        const otp = commonHelper.generateOtp();
        const email_payload = { project_name: APP.PROJECT_NAME, user_name: result?.data?.first_name, cidLogo: 'unique@Logo', otp }
        const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'registration.ejs'), email_payload);
        const logoPath = path.join(process.cwd(), './public', 'logo.png');

        const to = `${result?.data?.email}`
        const subject = `Your Verification Code`

        const attachments = [
            {
                filename: 'logo.png',
                path: logoPath,
                cid: 'unique@Logo',
            }
        ]

        const resendOtp = await services.emailService.nodemail(to, subject, template, attachments)
        if (!resendOtp.status) {
            return showResponse(false, resendOtp.message, null, statusCodes.API_ERROR);
        }

        await findOneAndUpdate(userModel, queryObject, { otp })
        return showResponse(true, responseMessage.users.otp_resend, null, statusCodes.SUCCESS);

    },

    changePassword: async (data: any, userId: string): Promise<ApiResponse> => {
        const { old_password, new_password } = data;

        const exists = await findOne(userModel, { _id: userId })
        if (!exists.status) {
            return showResponse(false, responseMessage.users.not_registered, null, statusCodes.API_ERROR)
        }

        const isValid = await commonHelper.verifyBycryptHash(old_password, exists.data?.password);
        if (!isValid) {
            return showResponse(false, responseMessage.users.invalid_old_password, null, statusCodes.API_ERROR)
        }

        const hashed = await commonHelper.bycrptPasswordHash(new_password)
        const updated = await findByIdAndUpdate(userModel, { password: hashed }, userId)
        if (!updated.status) {
            return showResponse(false, responseMessage.users.password_change_failed, null, statusCodes.API_ERROR)
        }
        return showResponse(true, responseMessage.users.password_change_successfull, null, statusCodes.SUCCESS)

    },

    getUserDetails: async (user_id: string): Promise<ApiResponse> => {

        const findUser = await findOne(userModel, { _id: user_id }, { password: 0, otp: 0, is_verified: 0 });
        if (!findUser.status) {
            return showResponse(false, responseMessage.users.invalid_user, null, statusCodes.API_ERROR)
        }

        const age = commonHelper.calculateAgeFromUnix(findUser.data.dob);

        const medications = await findAll(userMedicationModel, { user_id }, '_id name dose reason', 2)
        const allergies = await findAll(userAllergiesModel, { user_id }, '_id name', 2)
        const contacts = await findAll(userEmergencyContact, { user_id }, '_id name phone email', 2)

        const response = {
            ...findUser.data,
            age,
            medications: medications?.data,
            allergies: allergies?.data,
            contacts: contacts?.data,
        }

        return showResponse(true, responseMessage.users.user_detail, response, statusCodes.SUCCESS)

    },

    updateUserProfile: async (data: any, user_id: string, profile_pic: any): Promise<ApiResponse> => {
        const { display_name, first_name, last_name, dob, blood_group } = data

        console.log(user_id, "user_id,")
        const findUser = await findOne(userModel, { user_type: ROLE.USER, _id: user_id, status: { $ne: USER_STATUS.DELETED } })
        if (!findUser.status) {
            return showResponse(false, responseMessage.users.invalid_user, null, statusCodes.API_ERROR);
        }

        const updateObj: any = {}
        if (display_name) {
            updateObj.display_name = display_name
        }
        if (first_name) {
            updateObj.first_name = first_name
        }
        if (last_name) {
            updateObj.last_name = last_name
        }
        if (dob) {
            updateObj.dob = dob
        }
        if (blood_group) {
            updateObj.blood_group = blood_group
        }

        if (profile_pic) {
            //upload image to aws s3 bucket
            const s3Upload = await services.awsService.uploadFileToS3([profile_pic])
            if (!s3Upload.status) {
                return showResponse(false, responseMessage?.common.file_upload_error, null, statusCodes.FILE_UPLOAD_ERROR);
            }
            updateObj.profile_pic = s3Upload?.data[0]
        }

        const result = await findByIdAndUpdate(userModel, updateObj, user_id);
        if (!result.status) {
            return showResponse(false, responseMessage.users.user_account_update_error, null, statusCodes.API_ERROR);
        }

        delete result.data.password
        delete result.data.otp
        return showResponse(true, responseMessage.users.user_account_updated, result.data, statusCodes.SUCCESS);

    },

    async refreshToken(data: any): Promise<ApiResponse> {
        const { refresh_token } = data

        const response: any = await decodeToken(refresh_token)
        if (!response.status) {
            return showResponse(false, responseMessage?.middleware?.token_expired, null, statusCodes.REFRESH_TOKEN_ERROR);
        }

        const user_id = response?.data?.id

        const findUser = await findOne(userModel, { _id: user_id });
        if (!findUser.status) {
            return showResponse(false, responseMessage.users.invalid_user, null, statusCodes.API_ERROR)
        }

        if (findUser?.data?.status == USER_STATUS.DEACTIVATED) {
            return showResponse(false, responseMessage.middleware.deactivated_account, null, statusCodes.ACCOUNT_DISABLED);
        }
        if (findUser?.data?.status == USER_STATUS.DELETED) {
            return showResponse(false, responseMessage.middleware.deleted_account, null, statusCodes.ACCOUNT_DELETED);
        }

        const accessToken = await generateJwtToken(findUser.data._id, { user_type: 'user', type: "access", role: findUser?.data?.user_type }, APP.ACCESS_EXPIRY)
        // const refreshToken = await generateJwtToken(findUser.data._id, { user_type: 'user', type: "access", role: findUser?.data?.user_type }, APP.REFRESH_EXPIRY)

        return showResponse(true, 'token generated successfully', { token: accessToken }, statusCodes.SUCCESS)

    },

    async logoutUser(): Promise<ApiResponse> {
        return showResponse(true, responseMessage.users.logout_success, null, statusCodes.SUCCESS)

    },

    // async deleteAccount(data: any): Promise<ApiResponse> {
    //     const { user_id } = data
    //     const status = USER_STATUS.DELETED
    //     const result = await findByIdAndUpdate(userModel, { status }, user_id);

    //     if (result.status) {
    //         delete result.data.password
    //         const msg = status == USER_STATUS.DELETED ? 'deleted' : 'deactivated'
    //         return showResponse(true, `User account has been ${msg} `, null, statusCodes.SUCCESS);
    //     }
    //     return showResponse(false, 'Error While Perform Operation', null, statusCodes.API_ERROR);

    // }

}

export default UserAuthHandler 
