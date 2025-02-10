import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
// import * as commonHelper from "../../helpers/common.helper";
import userSubscriptionPlansModel from "../../models/User/user.subscription.plans.model";
import { SUBSCRIPTION_PLAN_STATUS } from '../../constants/app.constant';
import responseMessage from '../../constants/ResponseMessage'
import statusCodes from '../../constants/statusCodes'

const UserSubscriptionHandler = {
    planList: async (): Promise<ApiResponse> => {

        const itemsList = await userSubscriptionPlansModel.find({status:SUBSCRIPTION_PLAN_STATUS.ACTIVE});
        const response = {
            item_list:itemsList
        }
        const msgRes = itemsList.length > 0 ? responseMessage.users.subscription.plans_list : responseMessage.users.subscription.empty_plans_list
        return showResponse(true, msgRes, response, statusCodes.SUCCESS)

    },


}

export default UserSubscriptionHandler 
