import express, { Request, Response } from 'express'
import UserController from '../../controllers/User/user.controller'
import { showOutput } from '../../utils/response.util'
import { ApiResponse } from '../../utils/interfaces.util'
import middlewares from '../../middlewares'
const { verifyTokenUser } = middlewares.auth

const router = express.Router()

router.put('/allergy/add/update', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { allergies } = req.body
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.addOrUpdateAllergy({ allergies });
    return showOutput(res, result, result.code)
})

router.put('/medication/add/update', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { medications } = req.body
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.addOrUpdateMedication({ medications });
    return showOutput(res, result, result.code)
})

router.put('/contact/add/update', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { contacts } = req.body
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.addOrUpdateEmergencyContact({ contacts });
    return showOutput(res, result, result.code)
})

router.get("/info/list", verifyTokenUser, async (req: Request | any, res: Response) => {
    const { type, sort_column, sort_direction, page, limit, search_key } = req.query; //default show the new jobs only 
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.userInfoList(type, sort_column, sort_direction, page, limit, search_key);
    return showOutput(res, result, result.code)
})

router.get("/info/details", verifyTokenUser, async (req: Request | any, res: Response) => {
    const { item_id, type } = req.query; //default show the new jobs only 
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.userInfoDetails(item_id, type);
    return showOutput(res, result, result.code)
})

router.get("/info/screen", verifyTokenUser, async (req: Request | any, res: Response) => {
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.userInfoMainScreen();
    return showOutput(res, result, result.code)
})


router.delete('/info/delete', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { item_id, type } = req.body
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.deleteUserInfo({ item_id, type });
    return showOutput(res, result, result.code)
})


router.put('/setting/update', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { display_dob, send_sms, allow_gps, allow_multi_contact, dark_mode } = req.body
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.updateSettings({ display_dob, send_sms, allow_gps, allow_multi_contact, dark_mode });
    return showOutput(res, result, result.code)
})

router.post('/emergency/trigger', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { location } = req.body
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.emergencyNotificationTrigger({ location });
    return showOutput(res, result, result.code)
})


router.post('/emergency/call', async (req: Request | any, res: Response) => {
    const { location, user_id } = req.body
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.withoutTokenEmergencyNotificationTrigger({ location, user_id });
    return showOutput(res, result, result.code)
})

router.post('/contactus/fill', async (req: Request | any, res: Response) => {
    const { name, email, message } = req.body;
    const controller = new UserController(req, res)
    const result: ApiResponse = await controller.contactUs({ name, email, message });
    return showOutput(res, result, result.code)
})


export default router
