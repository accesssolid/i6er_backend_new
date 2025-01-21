import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, findByIdAndUpdate, findOneAndDelete } from "../../helpers/db.helpers";
import adminContactUsModel from "../../models/Admin/admin.contactus.model";
import statusCodes from '../../constants/statusCodes'
import { APP, USER_STATUS } from "../../constants/app.constant";
import { getCountAndPagination } from "../../helpers/common.helper";
import services from "../../services";
import responseMessage from "../../constants/ResponseMessage";
import ejs from 'ejs'
import path from 'path';


const AdminContactUsHandler = {
    async listContactDetails(data: any): Promise<ApiResponse> {
        const { sort_column = 'createdAt', sort_direction = 'desc', page, limit, search_key = '' } = data

        const queryObject: any = {
            status: { $ne: USER_STATUS.DELETED },
            name: { $regex: search_key, $options: 'i' }
        }

        const aggregate = [
            {
                $match: {
                    ...queryObject
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    message: 1,
                    createdAt: 1
                }
            },
            { $sort: { [sort_column]: sort_direction === 'asc' ? 1 : -1 } },

        ];

        const { totalCount, aggregation } = await getCountAndPagination(adminContactUsModel, aggregate, page, limit);
        const result = await adminContactUsModel.aggregate(aggregation)
        return showResponse(true, responseMessage?.common.data_retreive_sucess, { result, totalCount }, statusCodes.SUCCESS);

    },

    async getContactDetail(data: any): Promise<ApiResponse> {
        const { contact_id } = data;

        const response = await findOne(adminContactUsModel, { _id: contact_id, status: { $ne: USER_STATUS.DELETED } }, {});
        if (!response.status) {
            return showResponse(false, responseMessage?.common?.contactUs_not_found, null, statusCodes.API_ERROR);
        }

        return showResponse(true, responseMessage?.common?.contactUs_detail, response.data, statusCodes.SUCCESS);

    },

    async deleteContactUs(data: any): Promise<ApiResponse> {
        const { contact_id } = data;

        const response = await findOneAndDelete(adminContactUsModel, { _id: contact_id });
        if (!response.status) {
            return showResponse(false, responseMessage.common.delete_failed, null, statusCodes.API_ERROR);
        }

        return showResponse(true, responseMessage?.common?.contactUs_deleted, null, statusCodes.SUCCESS);

    },
    replyContactus: async (data: any): Promise<ApiResponse> => {
        const { contact_id, html } = data;
        const exists = await findOne(adminContactUsModel, { _id: contact_id, status: { $ne: USER_STATUS.DELETED } });
        if (!exists.status) {
            return showResponse(false, responseMessage.common.not_exist, null, statusCodes.API_ERROR)
        }

        const user_name = exists?.data?.name
        const logoPath = path.join(process.cwd(), './public', 'logo.png')

        const email_payload = { project_name: APP.PROJECT_NAME, user_name, cidLogo: 'unique@Logo', reply: html }
        const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'contactUs.ejs'), email_payload);
        const to = `${exists?.data?.email}`

        const attachments = [{
            filename: 'logo.png',
            path: logoPath,
            cid: 'unique@Logo',
        }]

        const subject = `Reply To Your Query `

        const sendReply = await services.emailService.nodemail(to, subject, template, attachments)

        if (sendReply.status) {
            const userObj = { is_reply: true }

            await findByIdAndUpdate(adminContactUsModel, userObj, (exists?.data?._id));
            return showResponse(true, 'reply sent successfully', null, statusCodes.SUCCESS);
        }
        return showResponse(false, 'error while sending reply', null, statusCodes.API_ERROR)
    },
    //end
}

export default AdminContactUsHandler;