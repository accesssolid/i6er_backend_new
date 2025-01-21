import { Request, Response } from 'express'
import { Route, Controller, Tags, Body, Get, Security, Put, Query, Delete, Post } from 'tsoa'
import { allergiesInterface, ApiResponse, emergencyContactInterface, medicationsInterface, userLocationInterface } from '../../utils/interfaces.util';
import handler from '../../handlers/User/user.handler'
import { showResponse } from '../../utils/response.util';
import statusCodes from '../../constants/statusCodes'
import { tryCatchWrapper } from '../../utils/config.util';
import { validateAddUpdateAllergy, validateAddUpdateContacts, validateAddUpdateMedications, validateDeleteUserInfo, validateUpdateSetting, validateUserInfoDetails, validateUserInfoList } from '../../validations/User/user.validator';
import { validateAddContactUs } from '../../validations/Admin/admin.contactus.validator';
@Tags('User Routes')
@Route('/user')

export default class UserController extends Controller {
    req: Request;
    res: Response;
    userId: string
    constructor(req: Request, res: Response) {
        super();
        this.req = req;
        this.res = res;
        this.userId = req.body.user ? req.body.user.id : ''
    }

    /**
* Update User Allergy
*/
    @Security('Bearer')
    @Put("/allergy/add/update")
    public async addOrUpdateAllergy(@Body() request: { allergies: Array<allergiesInterface>, }): Promise<ApiResponse> {

        const validate = validateAddUpdateAllergy(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.addOrUpdateAllergy);
        return wrappedFunc(request, this.userId); // Invoking the wrapped function 
    }
    //ends

    /**
    * Update User Medication
    */
    @Security('Bearer')
    @Put("/medication/add/update")
    public async addOrUpdateMedication(@Body() request: { medications: Array<medicationsInterface> }): Promise<ApiResponse> {

        const validate = validateAddUpdateMedications(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.addOrUpdateMedication);
        return wrappedFunc(request, this.userId); // Invoking the wrapped function 
    }
    //ends


    /**
    * Update User Emergency Contact
    */
    @Security('Bearer')
    @Put("/contact/add/update")
    public async addOrUpdateEmergencyContact(@Body() request: { contacts: Array<emergencyContactInterface> }): Promise<ApiResponse> {

        const validate = validateAddUpdateContacts(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.addOrUpdateEmergencyContact);
        return wrappedFunc(request, this.userId); // Invoking the wrapped function 
    }
    //ends

    /**
   * List User Info Medics And other
   * type == 'allergy', 'medication', 'contacts'
   *
   */
    @Security('Bearer')
    @Get("/info/list")
    public async userInfoList(@Query() type: string, @Query() sort_column?: string, @Query() sort_direction?: string, @Query() page?: number, @Query() limit?: number, @Query() search_key?: string): Promise<ApiResponse> {
        const body = { type, sort_column, sort_direction, page, limit, search_key }

        const validate = validateUserInfoList(body);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.userInfoList);
        return wrappedFunc(body, this.userId); // Invoking the wrapped function 
    }
    //ends

    /**
   * Details User Info Medics And other
   * type == 'allergy', 'medication', 'contacts'
   *
   */
    @Security('Bearer')
    @Get("/info/details")
    public async userInfoDetails(@Query() item_id: string, @Query() type: string): Promise<ApiResponse> {
        const body = { item_id, type }

        const validate = validateUserInfoDetails(body);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.userInfoDetails);
        return wrappedFunc(body, this.userId); // Invoking the wrapped function 
    }
    //ends

    /**
   *  User Info Screen Api Medics And other
   *
   */
    @Security('Bearer')
    @Get("/info/screen")
    public async userInfoMainScreen(): Promise<ApiResponse> {
        const wrappedFunc = tryCatchWrapper(handler.userInfoMainScreen);
        return wrappedFunc(this.userId); // Invoking the wrapped function 
    }
    //ends


    /**
* user info delete
* type == 'allergy', 'medication', 'contacts'
*/
    @Security('Bearer')
    @Delete("/info/delete")
    public async deleteUserInfo(@Body() request: { item_id: string, type: string }): Promise<ApiResponse> {

        const validate = validateDeleteUserInfo(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.deleteUserInfo);
        return wrappedFunc(request, this.userId); // Invoking the wrapped function 
    }
    //ends

    /**
* Update User Settings
*/
    @Security('Bearer')
    @Put("/setting/update")
    public async updateSettings(@Body() request: { display_dob: boolean, send_sms: boolean, allow_gps: boolean, allow_multi_contact: boolean, dark_mode: boolean }): Promise<ApiResponse> {

        const validate = validateUpdateSetting(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.updateSettings);
        return wrappedFunc(request, this.userId); // Invoking the wrapped function 
    }
    //ends

    /**
* Trigger Emergency Notification
*/
    @Security('Bearer')
    @Post("/emergency/trigger")
    public async emergencyNotificationTrigger(@Body() request: { location: userLocationInterface }): Promise<ApiResponse> {
        const wrappedFunc = tryCatchWrapper(handler.emergencyNotificationTrigger);
        return wrappedFunc(request, this.userId); // Invoking the wrapped function 
    }
    //ends

    /**
* Without token Trigger Emergency Notification
*/
    @Post("/emergency/call")
    public async withoutTokenEmergencyNotificationTrigger(@Body() request: { location: userLocationInterface, user_id: string }): Promise<ApiResponse> {
        const wrappedFunc = tryCatchWrapper(handler.withoutTokenEmergencyNotificationTrigger);
        return wrappedFunc(request); // Invoking the wrapped function 
    }
    //ends

    /**
   * Contact Us
   */
    @Post("/contactus/fill")
    public async contactUs(@Body() request: { name: string, email: string, message?: string }): Promise<ApiResponse> {

        const validate = validateAddContactUs(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.contactUs);
        return wrappedFunc(request); // Invoking the wrapped function 
    }

}





