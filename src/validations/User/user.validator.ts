import joi from '@hapi/joi';
import { INFO_TYPE } from '../../constants/app.constant';
const infoValues = Object.values(INFO_TYPE)

const userInfoListSchema = joi.object({
    type: joi.string().valid(...infoValues).required(),
    sort_column: joi.string().optional().allow(''),
    sort_direction: joi.string().optional().allow(''),
    page: joi.number().optional().allow(''),
    limit: joi.number().optional().allow(''),
    search_key: joi.string().optional().allow(''),
})

const userInfoDetailsSchema = joi.object({
    item_id: joi.string().required(),
    type: joi.string().valid(...infoValues).required(),
})

const deleteUserInfo = joi.object({
    item_id: joi.string().required(),
    type: joi.string().valid(...infoValues).required(),
})

const addAllergy = joi.object({
    name: joi.string().required(),
})

const addMedication = joi.object({
    name: joi.string().required(),
    dose: joi.string().required(),
    reason: joi.string().required(),
})

const addEmergencyContact = joi.object({
    name: joi.string().required(),
    phone: joi.string().required(),
    email: joi.string().required(),
})

const updateAllergy = joi.object({
    allergy_id: joi.string().required(),
    name: joi.string().optional().allow(''),
})

const updateSetting = joi.object({
    display_dob: joi.boolean().optional().allow(''),
    send_sms: joi.boolean().optional().allow(''),
    allow_gps: joi.boolean().optional().allow(''),
    allow_multi_contact: joi.boolean().optional().allow(''),
    dark_mode: joi.boolean().optional().allow(''),
})

const updateMedication = joi.object({
    medication_id: joi.string().required(),
    name: joi.string().optional().allow(''),
    dose: joi.string().optional().allow(''),
    reason: joi.string().optional().allow(''),
})

const updateEmergencyContact = joi.object({
    contact_id: joi.string().required(),
    name: joi.string().optional().allow(''),
    phone: joi.string().optional().allow(''),
    email: joi.string().optional().allow(''),
})


export const validateUserInfoList = (user: any) => {
    return userInfoListSchema.validate(user)
}

export const validateUserInfoDetails = (user: any) => {
    return userInfoDetailsSchema.validate(user)
}

export const validateDeleteUserInfo = (user: any) => {
    return deleteUserInfo.validate(user)
}

export const validateAddAllergy = (user: any) => {
    return addAllergy.validate(user)
}

export const validateAddMedication = (user: any) => {
    return addMedication.validate(user)
}

export const validateAddEmergencyContact = (user: any) => {
    return addEmergencyContact.validate(user)
}

export const validateUpdateAllergy = (user: any) => {
    return updateAllergy.validate(user)
}

export const validateUpdateSetting = (user: any) => {
    return updateSetting.validate(user)
}

export const validateUpdateMedication = (user: any) => {
    return updateMedication.validate(user)
}

export const validateUpdateEmergencyContact = (user: any) => {
    return updateEmergencyContact.validate(user)
}

