import { Request, Response } from 'express'
import { Route, Controller, Tags, Get } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
// import {  } from '../../validations/User/user.subscription.validator';
import handler from '../../handlers/User/user.subscription.handler'
// import { showResponse } from '../../utils/response.util';
// import statusCodes from '../../constants/statusCodes'
import { tryCatchWrapper } from '../../utils/config.util';

@Tags('User Subscription Routes')
@Route('/user/subscription')

export default class UserSubscriptionController extends Controller {
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
   * Get Subscription plans list mobile side
   */
    // @Security('Bearer')
    @Get("/plan_list")
    public async planList(): Promise<ApiResponse> {
        const wrappedFunc = tryCatchWrapper(handler.planList);
        return wrappedFunc(); // Invoking the wrapped function 
    }
    //ends   

}





