import ejs from 'ejs'
import path from 'path'
import moment from "moment";
import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, createOne, findByIdAndUpdate, findOneAndUpdate, findAndUpdatePushOrSet, insertMany, findOneAndDelete } from "../../helpers/db.helpers";
import { decodeToken, generateJwtToken } from "../../utils/auth.util";
import * as commonHelper from "../../helpers/common.helper";
import userModel from "../../models/User/user.auth.model";
import { APP, INFO_TYPE, ROLE, USER_STATUS } from '../../constants/app.constant';
import services from '../../services';
import responseMessage from '../../constants/ResponseMessage'
import statusCodes from '../../constants/statusCodes'
import userAllergiesModel from '../../models/User/user.allergies.model';
import userMedicationModel from '../../models/User/user.medication.model';
import userEmergencyContact from '../../models/User/user.emergencyContact';

const infoModel = {
    [INFO_TYPE.ALLERGY]: userAllergiesModel,
    [INFO_TYPE.MEDICATION]: userMedicationModel,
    [INFO_TYPE.CONTACTS]: userEmergencyContact
}

const UserHandler = {

    addAllergy: async (data: any, user_id: string): Promise<ApiResponse> => {
        const { name } = data

        const find = await findOne(userAllergiesModel, { name, user_id })
        if (find.status) {
            return showResponse(false, responseMessage.common.already_existed, null, statusCodes.API_ERROR);
        }

        data.user_id = user_id
        const ref = new userAllergiesModel(data)
        const result = await createOne(ref)
        if (!result.status) {
            return showResponse(false, responseMessage.common.added_err, null, statusCodes.API_ERROR);
        }

        return showResponse(true, responseMessage.common.added_success, result.data, statusCodes.SUCCESS);

    },
    addMedication: async (data: any, user_id: string): Promise<ApiResponse> => {
        const { name } = data

        const find = await findOne(userMedicationModel, { name, user_id })
        if (find.status) {
            return showResponse(false, `${name} ${responseMessage.common.already_existed}`, null, statusCodes.API_ERROR);
        }

        data.user_id = user_id
        const ref = new userMedicationModel(data)
        const result = await createOne(ref)
        if (!result.status) {
            return showResponse(false, responseMessage.common.added_err, null, statusCodes.API_ERROR);
        }

        return showResponse(true, responseMessage.common.added_success, result.data, statusCodes.SUCCESS);

    },

    addEmergencyContact: async (data: any, user_id: string): Promise<ApiResponse> => {
        const { name, phone, email } = data

        const find = await findOne(userEmergencyContact, { email, user_id })
        if (find.status) {
            return showResponse(false, `email ${responseMessage.common.already_existed}`, null, statusCodes.API_ERROR);
        }

        if (find.data?.phone === phone) {
            return showResponse(false, `phone ${responseMessage.common.already_existed}`, null, statusCodes.API_ERROR);
        }

        data.user_id = user_id
        const ref = new userEmergencyContact(data)
        const result = await createOne(ref)
        if (!result.status) {
            return showResponse(false, responseMessage.common.added_err, null, statusCodes.API_ERROR);
        }

        return showResponse(true, responseMessage.common.added_success, result.data, statusCodes.SUCCESS);

    },

    userInfoList: async (data: any, user_id: string): Promise<ApiResponse> => {
        const { type, sort_column = "createdAt", sort_direction = "desc", page, limit, search_key = "" } = data

        const model = infoModel[type]

        const aggregate: any = [
            {
                $match: {
                    user_id: commonHelper.convertToObjectId(user_id),
                    $or: [
                        { name: { $regex: search_key, $options: 'i' } },
                    ]
                }
            },
            {
                $sort: { [sort_column]: sort_direction === 'asc' ? 1 : -1 }
            },
            {
                $project: {
                    user_id: 0,
                    createdAt: 0,
                    updatedAt: 0,
                }
            }
        ];
        const { totalCount, aggregation } = await commonHelper.getCountAndPagination(model, aggregate, page, limit);

        const result = await model.aggregate(aggregation);

        return showResponse(true, responseMessage.common.data_retreive_sucess, { result, totalCount }, statusCodes.SUCCESS)

    },

    updateAllergy: async (data: any, user_id: string): Promise<ApiResponse> => {
        const { allergy_id, name } = data

        const find = await findOne(userAllergiesModel, { _id: allergy_id, user_id })
        if (!find.status) {
            return showResponse(false, responseMessage.common.invalid_id, null, statusCodes.API_ERROR);
        }

        const updateObj: any = {}

        if (name) {
            updateObj.name = name
        }

        const result = await findByIdAndUpdate(userAllergiesModel, updateObj, allergy_id);
        if (!result.status) {
            return showResponse(false, responseMessage.common.update_failed, null, statusCodes.API_ERROR);
        }

        return showResponse(true, responseMessage.common.update_sucess, result.data, statusCodes.SUCCESS);

    },
    updateMedication: async (data: any, user_id: string): Promise<ApiResponse> => {
        const { medication_id, name, dose, reason } = data

        const find = await findOne(userMedicationModel, { _id: medication_id, user_id })
        if (!find.status) {
            return showResponse(false, responseMessage.common.invalid_id, null, statusCodes.API_ERROR);
        }

        const updateObj: any = {}

        if (name) {
            updateObj.name = name
        }
        if (dose) {
            updateObj.dose = dose
        }
        if (reason) {
            updateObj.reason = reason
        }

        const result = await findByIdAndUpdate(userMedicationModel, updateObj, medication_id);
        if (!result.status) {
            return showResponse(false, responseMessage.common.update_failed, null, statusCodes.API_ERROR);
        }

        return showResponse(true, responseMessage.common.update_sucess, result.data, statusCodes.SUCCESS);

    },

    updateEmergencyContact: async (data: any, user_id: string): Promise<ApiResponse> => {
        const { contact_id, name, phone, email } = data

        const find = await findOne(userEmergencyContact, { _id: contact_id, user_id })
        if (!find.status) {
            return showResponse(false, responseMessage.common.invalid_id, null, statusCodes.API_ERROR);
        }

        const updateObj: any = {}

        if (name) {
            updateObj.name = name
        }
        if (phone) {
            updateObj.phone = phone
        }
        if (email) {
            updateObj.email = email
        }

        const result = await findByIdAndUpdate(userEmergencyContact, updateObj, contact_id);
        if (!result.status) {
            return showResponse(false, responseMessage.common.update_failed, null, statusCodes.API_ERROR);
        }

        return showResponse(true, responseMessage.common.update_sucess, result.data, statusCodes.SUCCESS);

    },

    deleteUserInfo: async (data: any, user_id: string): Promise<ApiResponse> => {
        const { item_id, type } = data

        const model = infoModel[type]
        const matchObj = { _id: item_id, user_id }

        const find = await findOne(model, matchObj)
        if (!find.status) {
            return showResponse(false, responseMessage.common.invalid_id, null, statusCodes.API_ERROR);
        }

        const result = await findOneAndDelete(model, matchObj);
        if (!result.status) {
            return showResponse(false, responseMessage.common.delete_failed, null, statusCodes.API_ERROR);
        }

        return showResponse(true, responseMessage.common.delete_sucess, {}, statusCodes.SUCCESS);

    },


}

export default UserHandler 
