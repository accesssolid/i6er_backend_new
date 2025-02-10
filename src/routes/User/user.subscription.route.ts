import express, { Request, Response } from 'express'
import UserSubscriptionController from '../../controllers/User/user.subscription.controller'
import { showOutput } from '../../utils/response.util'
import { ApiResponse } from '../../utils/interfaces.util'
import middlewares from '../../middlewares'
const { verifyTokenUser } = middlewares.auth
const { multer } = middlewares.fileUpload

const router = express.Router()


router.get('/plan_list', async (req: Request | any, res: Response) => {
    const controller = new UserSubscriptionController(req, res)
    const result: ApiResponse = await controller.planList();
    return showOutput(res, result, result.code)
})


export default router
