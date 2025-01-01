import joi from '@hapi/joi';
import { USER_STATUS } from '../../constants/app.constant';
import { INFO_TYPE } from '../../constants/app.constant';
const infoValues = Object.values(INFO_TYPE)

const getCustomerDetails = joi.object({
    user_id: joi.string().required(),
})

const updateUserStatus = joi.object({
    user_id: joi.string().required(),
    status: joi.number().valid(USER_STATUS.ACTIVE, USER_STATUS.DEACTIVATED, USER_STATUS.DELETED).required(),

})
const dashboardSchema = joi.object({
    past_day: joi.optional().valid('1M', '6M', '1Y', 'MAX'),
})


export const validateGetCustomerDetails = (admin: any) => {
    return getCustomerDetails.validate(admin)
}
export const validateUpdateUserStatus = (admin: any) => {
    return updateUserStatus.validate(admin)
}


export const validateDashboard = (admin: any) => {
    return dashboardSchema.validate(admin)
}

const userInfoListSchema = joi.object({
    user_id: joi.string().required(),
    type: joi.string().valid(...infoValues).required(),
    sort_column: joi.string().optional().allow(''),
    sort_direction: joi.string().optional().allow(''),
    page: joi.number().optional().allow(''),
    limit: joi.number().optional().allow(''),
    search_key: joi.string().optional().allow(''),
})

export const validateUserInfoListAdmin = (admin: any) => {
    return userInfoListSchema.validate(admin)
}

