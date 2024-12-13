import express, { Request, Response } from 'express'
import UserController from '../../controllers/User/user.controller'
import { showOutput } from '../../utils/response.util'
import { ApiResponse } from '../../utils/interfaces.util'
import middlewares from '../../middlewares'
const { verifyTokenUser } = middlewares.auth
const { multer } = middlewares.fileUpload

const router = express.Router()

router.post('/allergy/add', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { name } = req.body
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.addAllergy({ name });
    return showOutput(res, result, result.code)
})

router.post('/medication/add', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { name, dose, reason } = req.body
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.addMedication({ name, dose, reason });
    return showOutput(res, result, result.code)
})

router.post('/contact/add', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { name, phone, email } = req.body
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.addEmergencyContact({ name, phone, email });
    return showOutput(res, result, result.code)
})

router.get("/info/list", verifyTokenUser, async (req: Request | any, res: Response) => {
    const { type, sort_column, sort_direction, page, limit, search_key } = req.query; //default show the new jobs only 
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.userInfoList(type, sort_column, sort_direction, page, limit, search_key);
    return showOutput(res, result, result.code)
})


router.put('/allergy/update', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { allergy_id, name } = req.body
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.updateAllergy({ allergy_id, name });
    return showOutput(res, result, result.code)
})

router.put('/medication/update', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { medication_id, name, dose, reason } = req.body
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.updateMedication({ medication_id, name, dose, reason });
    return showOutput(res, result, result.code)
})

router.put('/contact/update', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { contact_id, name, phone, email } = req.body
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.updateEmergencyContact({ contact_id, name, phone, email });
    return showOutput(res, result, result.code)
})

router.delete('/info/delete', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { item_id, type } = req.body
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.deleteUserInfo({ item_id, type });
    return showOutput(res, result, result.code)
})



export default router
