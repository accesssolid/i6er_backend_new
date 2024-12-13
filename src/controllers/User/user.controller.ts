import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Get, Security, UploadedFile, FormField, Put, Query, Delete } from 'tsoa'
import { allergiesInterface, ApiResponse, emergencyContactInterface, medicationsInterface } from '../../utils/interfaces.util';
import handler from '../../handlers/User/user.handler'
import { showResponse } from '../../utils/response.util';
import statusCodes from '../../constants/statusCodes'
import { tryCatchWrapper } from '../../utils/config.util';
import { validateAddAllergy, validateAddEmergencyContact, validateAddMedication, validateDeleteUserInfo, validateUpdateAllergy, validateUpdateEmergencyContact, validateUpdateMedication, validateUserInfoList } from '../../validations/User/user.validator';

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
* Add User Allergy
*/
    @Security('Bearer')
    @Post("/allergy/add")
    public async addAllergy(@Body() request: { name: string }): Promise<ApiResponse> {

        const validate = validateAddAllergy(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.addAllergy);
        return wrappedFunc(request, this.userId); // Invoking the wrapped function 
    }
    //ends

    /**
    * Add User Medication
    */
    @Security('Bearer')
    @Post("/medication/add")
    public async addMedication(@Body() request: { name: string, dose: string, reason: string }): Promise<ApiResponse> {

        const validate = validateAddMedication(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.addMedication);
        return wrappedFunc(request, this.userId); // Invoking the wrapped function 
    }
    //ends


    /**
    * Add User Emergency Contact
    */
    @Security('Bearer')
    @Post("/contact/add")
    public async addEmergencyContact(@Body() request: { name: string, phone: string, email: string }): Promise<ApiResponse> {

        const validate = validateAddEmergencyContact(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.addEmergencyContact);
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
* Update User Allergy
*/
    @Security('Bearer')
    @Put("/allergy/update")
    public async updateAllergy(@Body() request: { allergy_id: string, name: string }): Promise<ApiResponse> {

        const validate = validateUpdateAllergy(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.updateAllergy);
        return wrappedFunc(request, this.userId); // Invoking the wrapped function 
    }
    //ends

    /**
    * Update User Medication
    */
    @Security('Bearer')
    @Put("/medication/update")
    public async updateMedication(@Body() request: { medication_id: string, name: string, dose: string, reason: string }): Promise<ApiResponse> {

        const validate = validateUpdateMedication(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.updateMedication);
        return wrappedFunc(request, this.userId); // Invoking the wrapped function 
    }
    //ends


    /**
    * Update User Emergency Contact
    */
    @Security('Bearer')
    @Put("/contact/update")
    public async updateEmergencyContact(@Body() request: { contact_id: string, name: string, phone: string, email: string }): Promise<ApiResponse> {

        const validate = validateUpdateEmergencyContact(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.updateEmergencyContact);
        return wrappedFunc(request, this.userId); // Invoking the wrapped function 
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





}





