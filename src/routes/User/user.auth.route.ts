import express, { Request, Response } from 'express'
import UserAuthController from '../../controllers/User/user.auth.controller'
import { showOutput } from '../../utils/response.util'
import { ApiResponse } from '../../utils/interfaces.util'
import middlewares from '../../middlewares'
const { verifyTokenUser } = middlewares.auth
const { multer } = middlewares.fileUpload

const router = express.Router()

router.post('/login', async (req: Request | any, res: Response) => {
    const { email, password } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.login({ email, password });
    return showOutput(res, result, result.code)
})


router.post('/register', async (req: Request | any, res: Response) => {
    const { display_name, first_name, last_name, email, password, dob, blood_group, allergies, medications, emergency_contacts } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.register({ display_name, first_name, last_name, email, password, dob, blood_group, allergies, medications, emergency_contacts });
    return showOutput(res, result, result.code)
})

router.post('/upload_file', multer.addToMulter.single('file'), async (req: Request | any, res: Response) => {
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.uploadFile(req.file as Express.Multer.File);
    return showOutput(res, result, result.code)

})

router.post('/forgot_password', async (req: Request | any, res: Response) => {
    const { email } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.forgotPassword({ email });
    return showOutput(res, result, result.code)
})

router.post('/reset_password', async (req: Request | any, res: Response) => {
    const { email, new_password, otp } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.resetPassword({ email, new_password, otp });
    return showOutput(res, result, result.code)
})

router.post('/verify_otp', async (req: Request | any, res: Response) => {
    const { email, otp } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.verifyOtp({ email, otp });
    return showOutput(res, result, result.code)
})

router.post('/resend_otp', async (req: Request | any, res: Response) => {
    const { email } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.resendOtp({ email });
    return showOutput(res, result, result.code)
})


router.post('/change_password', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { old_password, new_password } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.changePassword({ old_password, new_password });
    return showOutput(res, result, result.code)
})

router.get('/details', verifyTokenUser, async (req: Request | any, res: Response) => {
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.getUserDetails();
    return showOutput(res, result, result.code)
})

router.put('/profile', multer.addToMulter.single('profile_pic'), verifyTokenUser, async (req: Request | any, res: Response) => {
    const { display_name, first_name, last_name, dob, blood_group } = req.body
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.updateUserProfile(display_name, first_name, last_name, dob, blood_group, req.file);
    return showOutput(res, result, result.code)
})

router.post('/refresh_token', multer.addToMulter.none(), async (req: Request | any, res: Response) => {
    const { refresh_token } = req.body
    const commonController = new UserAuthController(req, res)
    const result: ApiResponse = await commonController.refreshToken(refresh_token);
    return showOutput(res, result, result.code)
})

router.post('/logout', async (req: Request | any, res: Response) => {
    const userAuthController = new UserAuthController(req, res)
    const result: ApiResponse = await userAuthController.logoutUser();
    return showOutput(res, result, result.code)
})

// router.delete('/delete_account', verifyTokenUser, async (req: Request | any, res: Response) => {
//     const { user_id } = req.body
//     const controller = new UserAuthController(req, res)
//     const result: ApiResponse = await controller.deleteAccount({ user_id });
//     return showOutput(res, result, result.code)

// })

export default router
