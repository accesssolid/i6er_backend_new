import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, findByIdAndUpdate, insertMany, findOneAndDelete, findAll, getCount, deleteMany } from "../../helpers/db.helpers";
import * as commonHelper from "../../helpers/common.helper";
import { APP, INFO_TYPE } from '../../constants/app.constant';
import services from '../../services';
import responseMessage from '../../constants/ResponseMessage'
import statusCodes from '../../constants/statusCodes'
import userAllergiesModel from '../../models/User/user.allergies.model';
import userMedicationModel from '../../models/User/user.medication.model';
import userEmergencyContact from '../../models/User/user.emergencyContact';
import userAuthModel from '../../models/User/user.auth.model';
import path from 'path'
import ejs from 'ejs'

const infoModel = {
    [INFO_TYPE.ALLERGY]: userAllergiesModel,
    [INFO_TYPE.MEDICATION]: userMedicationModel,
    [INFO_TYPE.CONTACTS]: userEmergencyContact
}

const UserHandler = {

    addOrUpdateAllergy: async (data: any, user_id: string): Promise<ApiResponse> => {
        const { allergies } = data

        let inserted: any = []

        if (allergies && allergies.length > 0) {

            const payload = allergies.map((allergy: any) => {
                const { _id, createdAt, updatedAt, ...rest } = allergy; // Exclude _id from the object
                return { ...rest, user_id }; // Add user_id to the remaining fields
            });


            //delete previous trades and replace by new trades
            const deletedAll = await deleteMany(userAllergiesModel, { user_id })
            if (deletedAll.status) {
                inserted = await insertMany(userAllergiesModel, payload)
                if (!inserted.status) {
                    return showResponse(false, responseMessage.users.user_account_update_error, null, statusCodes.API_ERROR);
                }
            }//ends

        }//ends 



        return showResponse(true, responseMessage.common.update_sucess, inserted?.data, statusCodes.SUCCESS);

    },
    addOrUpdateMedication: async (data: any, user_id: string): Promise<ApiResponse> => {
        const { medications, } = data

        let inserted: any

        if (medications && medications.length > 0) {

            const payload = medications.map((medic: any) => {
                const { _id, createdAt, updatedAt, ...rest } = medic; // Exclude _id from the object
                return { ...rest, user_id }; // Add user_id to the remaining fields
            });
            console.log(payload, "payloadddd")
            //delete previous trades and replace by new trades
            const deletedAll = await deleteMany(userMedicationModel, { user_id })
            if (deletedAll.status) {
                inserted = await insertMany(userMedicationModel, payload)
                if (!inserted.status) {
                    return showResponse(false, responseMessage.users.user_account_update_error, null, statusCodes.API_ERROR);
                }
            }//ends

        }//ends

        return showResponse(true, responseMessage.common.update_sucess, inserted?.data, statusCodes.SUCCESS);

    },

    addOrUpdateEmergencyContact: async (data: any, user_id: string): Promise<ApiResponse> => {
        const { contacts } = data

        let inserted: any

        if (contacts && contacts.length > 0) {

            const payload = contacts.map((conta: any) => {
                const { _id, createdAt, updatedAt, ...rest } = conta; // Exclude _id from the object
                return { ...rest, user_id }; // Add user_id to the remaining fields
            });

            //delete previous trades and replace by new trades
            const deletedAll = await deleteMany(userEmergencyContact, { user_id })
            if (deletedAll.status) {
                inserted = await insertMany(userEmergencyContact, payload)
                if (!inserted.status) {
                    return showResponse(false, responseMessage.users.user_account_update_error, null, statusCodes.API_ERROR);
                }
            }//ends

        }//ends

        return showResponse(true, responseMessage.common.update_sucess, inserted?.data, statusCodes.SUCCESS);

    },

    // addAllergy: async (data: any, user_id: string): Promise<ApiResponse> => {
    //     const { name } = data

    //     const find = await findOne(userAllergiesModel, { name, user_id })
    //     if (find.status) {
    //         return showResponse(false, responseMessage.common.already_existed, null, statusCodes.API_ERROR);
    //     }

    //     data.user_id = user_id
    //     const ref = new userAllergiesModel(data)
    //     const result = await createOne(ref)
    //     if (!result.status) {
    //         return showResponse(false, responseMessage.common.added_err, null, statusCodes.API_ERROR);
    //     }

    //     return showResponse(true, responseMessage.common.added_success, result.data, statusCodes.SUCCESS);

    // },
    // addMedication: async (data: any, user_id: string): Promise<ApiResponse> => {
    //     const { name } = data

    //     const find = await findOne(userMedicationModel, { name, user_id })
    //     if (find.status) {
    //         return showResponse(false, `${name} ${responseMessage.common.already_existed}`, null, statusCodes.API_ERROR);
    //     }

    //     data.user_id = user_id
    //     const ref = new userMedicationModel(data)
    //     const result = await createOne(ref)
    //     if (!result.status) {
    //         return showResponse(false, responseMessage.common.added_err, null, statusCodes.API_ERROR);
    //     }

    //     return showResponse(true, responseMessage.common.added_success, result.data, statusCodes.SUCCESS);

    // },

    // addEmergencyContact: async (data: any, user_id: string): Promise<ApiResponse> => {
    //     const { name, phone, email } = data

    //     const find = await findOne(userEmergencyContact, { email, user_id })
    //     if (find.status) {
    //         return showResponse(false, `email ${responseMessage.common.already_existed}`, null, statusCodes.API_ERROR);
    //     }

    //     if (find.data?.phone === phone) {
    //         return showResponse(false, `phone ${responseMessage.common.already_existed}`, null, statusCodes.API_ERROR);
    //     }

    //     data.user_id = user_id
    //     const ref = new userEmergencyContact(data)
    //     const result = await createOne(ref)
    //     if (!result.status) {
    //         return showResponse(false, responseMessage.common.added_err, null, statusCodes.API_ERROR);
    //     }

    //     return showResponse(true, responseMessage.common.added_success, result.data, statusCodes.SUCCESS);

    // },

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
    userInfoDetails: async (data: any, user_id: string): Promise<ApiResponse> => {
        const { item_id, type } = data

        const model = infoModel[type]

        const findItem = await findOne(model, { _id: item_id, user_id }, { createdAt: 0, updatedAt: 0 })
        if (!findItem.status) {
            return showResponse(false, responseMessage.common.invalid_id, {}, statusCodes.API_ERROR)
        }

        return showResponse(true, responseMessage.common.data_retreive_sucess, findItem?.data, statusCodes.SUCCESS)

    },

    userInfoMainScreen: async (user_id: string): Promise<ApiResponse> => {

        const findUser = await findOne(userAuthModel, { _id: user_id }, { blood_group: 1, display_name: 1, dob: 1 })
        if (!findUser.status) {
            return showResponse(false, responseMessage.users.invalid_user, {}, statusCodes.API_ERROR)
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

        return showResponse(true, responseMessage.common.data_retreive_sucess, response, statusCodes.SUCCESS)

    },

    // updateAllergy: async (data: any, user_id: string): Promise<ApiResponse> => {
    //     const { allergy_id, name } = data

    //     const find = await findOne(userAllergiesModel, { _id: allergy_id, user_id })
    //     if (!find.status) {
    //         return showResponse(false, responseMessage.common.invalid_id, null, statusCodes.API_ERROR);
    //     }

    //     const updateObj: any = {}

    //     if (name) {
    //         updateObj.name = name
    //     }

    //     const result = await findByIdAndUpdate(userAllergiesModel, updateObj, allergy_id);
    //     if (!result.status) {
    //         return showResponse(false, responseMessage.common.update_failed, null, statusCodes.API_ERROR);
    //     }

    //     return showResponse(true, responseMessage.common.update_sucess, result.data, statusCodes.SUCCESS);

    // },
    // updateMedication: async (data: any, user_id: string): Promise<ApiResponse> => {
    //     const { medication_id, name, dose, reason } = data

    //     const find = await findOne(userMedicationModel, { _id: medication_id, user_id })
    //     if (!find.status) {
    //         return showResponse(false, responseMessage.common.invalid_id, null, statusCodes.API_ERROR);
    //     }

    //     const updateObj: any = {}

    //     if (name) {
    //         updateObj.name = name
    //     }
    //     if (dose) {
    //         updateObj.dose = dose
    //     }
    //     if (reason) {
    //         updateObj.reason = reason
    //     }

    //     const result = await findByIdAndUpdate(userMedicationModel, updateObj, medication_id);
    //     if (!result.status) {
    //         return showResponse(false, responseMessage.common.update_failed, null, statusCodes.API_ERROR);
    //     }

    //     return showResponse(true, responseMessage.common.update_sucess, result.data, statusCodes.SUCCESS);

    // },

    // updateEmergencyContact: async (data: any, user_id: string): Promise<ApiResponse> => {
    //     const { contact_id, name, phone, email } = data

    //     const find = await findOne(userEmergencyContact, { _id: contact_id, user_id })
    //     if (!find.status) {
    //         return showResponse(false, responseMessage.common.invalid_id, null, statusCodes.API_ERROR);
    //     }

    //     const updateObj: any = {}

    //     if (name) {
    //         updateObj.name = name
    //     }
    //     if (phone) {
    //         updateObj.phone = phone
    //     }
    //     if (email) {
    //         updateObj.email = email
    //     }

    //     const result = await findByIdAndUpdate(userEmergencyContact, updateObj, contact_id);
    //     if (!result.status) {
    //         return showResponse(false, responseMessage.common.update_failed, null, statusCodes.API_ERROR);
    //     }

    //     return showResponse(true, responseMessage.common.update_sucess, result.data, statusCodes.SUCCESS);

    // },

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

    updateSettings: async (data: any, user_id: string): Promise<ApiResponse> => {
        const { display_dob, send_sms, allow_gps, allow_multi_contact, dark_mode } = data

        if (allow_multi_contact !== undefined && !allow_multi_contact) {
            const count = await getCount(userEmergencyContact, { user_id })
            //if multiple contacts are present and wants to off multiple contacts then throw error message
            if (count?.data > 1) {
                return showResponse(false, 'multiple contacts are already present delete them first', null, statusCodes.API_ERROR);
            }
        }

        const updateObj: any = {}

        // Check if each setting is present in the input data and add it to the update object
        if (display_dob !== undefined) {
            updateObj['settings.display_dob'] = display_dob;
        }
        if (send_sms !== undefined) {
            updateObj['settings.send_sms'] = send_sms;
        }
        if (allow_gps !== undefined) {
            updateObj['settings.allow_gps'] = allow_gps;
        }
        if (allow_multi_contact !== undefined) {
            updateObj['settings.allow_multi_contact'] = allow_multi_contact;
        }
        if (dark_mode !== undefined) {
            updateObj['settings.dark_mode'] = dark_mode;
        }

        const result = await findByIdAndUpdate(userAuthModel, updateObj, user_id);
        if (!result.status) {
            return showResponse(false, responseMessage.common.update_failed, null, statusCodes.API_ERROR);
        }


        delete result.data.password
        delete result.data.otp

        const age = commonHelper.calculateAgeFromUnix(result.data.dob);

        const medications = await findAll(userMedicationModel, { user_id }, '_id name dose reason')
        const allergies = await findAll(userAllergiesModel, { user_id }, '_id name')
        const contacts = await findAll(userEmergencyContact, { user_id }, '_id name phone email')

        const response = {
            ...result.data,
            age,
            medications: medications?.data ?? [],
            allergies: allergies?.data ?? [],
            contacts: contacts?.data ?? [],
        }

        return showResponse(true, responseMessage.common.update_sucess, response, statusCodes.SUCCESS);

    },

    emergencyNotificationTrigger: async (data: any): Promise<ApiResponse> => {
        const { location, user_id } = data

        const findUser = await findOne(userAuthModel, { _id: user_id })
        if (!findUser.status) {
            return showResponse(false, responseMessage.users.invalid_user, null, statusCodes.API_ERROR);
        }

        const userData = findUser?.data

        const emergencyContacts = await findAll(userEmergencyContact, { user_id })
        const userAllergies = await findAll(userAllergiesModel, { user_id }, 'name')
        const userMedications = await findAll(userMedicationModel, { user_id }, 'name dose reason')
        const allergies = userAllergies?.data?.map((aller: any) => {
            return aller?.name
        });
        const medications = userMedications.data
        const blood_group = userData?.blood_group
        const user_name = userData?.display_name
        const age = commonHelper.calculateAgeFromUnix(userData?.dob) ?? 0

        if (emergencyContacts.status && emergencyContacts?.data?.length > 0) {

            const emailSend = emergencyContacts?.data?.map(async (contact: any) => {
                const emergency_contact_name = contact?.name
                const locationDetails = location?.coordinates ? `${location?.name} longitude:${location.coordinates[0]}, latitude:${location.coordinates[1]}` : '';
                const email_payload = { project_name: APP.PROJECT_NAME, user_name, cidLogo: 'unique@Logo', emergency_contact_name, location: locationDetails, allergies, medications, blood_group, age }
                const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'emergency.ejs'), email_payload);
                const logoPath = path.join(process.cwd(), './public', 'logo.png');

                const to = `${contact?.email}`
                const subject = `Urgent: Emergency Call Alert for ${user_name}`

                const attachments = [
                    {
                        filename: 'logo.png',
                        path: logoPath,
                        cid: 'unique@Logo',
                    }
                ]

                const forgotPassMail = await services.emailService.nodemail(to, subject, template, attachments)
            })

        }//ends


        return showResponse(true, 'Emergency Email Sent Successfully', null, statusCodes.SUCCESS);

    },

    // emergencyNotificationTrigger: async (data: any, user_id: string): Promise<ApiResponse> => {
    //     const { location } = data

    //     const findUser = await findOne(userAuthModel, { _id: user_id })
    //     if (!findUser.status) {
    //         return showResponse(false, responseMessage.users.invalid_user, null, statusCodes.API_ERROR);
    //     }

    //     const userData = findUser?.data

    //     const emergencyContacts = await findAll(userEmergencyContact, { user_id })
    //     const userAllergies = await findAll(userAllergiesModel, { user_id })
    //     const userMedications = await findAll(userMedicationModel, { user_id })
    //     const allergies = userAllergies?.data?.map((aller: any) => {
    //         // Destructuring to remove unwanted fields
    //         const { createdAt, updatedAt, user_id, _id, ...cleanedAllergy } = aller;
    //         return cleanedAllergy; // Returning the object without the excluded fields
    //     });

    //     const medications = userMedications?.data?.map((med: any) => {
    //         // Destructuring to remove unwanted fields
    //         const { createdAt, updatedAt, user_id, _id, ...cleanedMedication } = med;
    //         return cleanedMedication; // Returning the object without the excluded fields
    //     });
    //     const blood_group = userData?.blood_group
    //     const user_name = userData?.display_name
    //     const age = commonHelper.calculateAgeFromUnix(userData?.dob) ?? 0

    //     if (emergencyContacts.status && emergencyContacts?.data?.length > 0) {

    //         const emailSend = emergencyContacts?.data?.map(async (contact: any) => {


    //             const email_payload = { project_name: APP.PROJECT_NAME, user_name, cidLogo: 'unique@Logo', allergies, medications, blood_group, age }
    //             const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'emergency.ejs'), email_payload);
    //             const logoPath = path.join(process.cwd(), './public', 'logo.png');

    //             const to = `${contact?.email}`
    //             const subject = `Emergency Email`

    //             const attachments = [
    //                 {
    //                     filename: 'logo.png',
    //                     path: logoPath,
    //                     cid: 'unique@Logo',
    //                 }
    //             ]

    //             const forgotPassMail = await services.emailService.nodemail(to, subject, template, attachments)
    //             console.log(forgotPassMail, "forgotmaill")
    //         })

    //     }//ends


    //     return showResponse(true, 'Emergency Email Sent Successfully', null, statusCodes.SUCCESS);

    // },


}

export default UserHandler 
