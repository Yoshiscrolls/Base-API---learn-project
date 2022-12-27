import { IMiddleware } from "./middleware-interface";
import { Response, Request, NextFunction } from "express";
import { HttpError } from "../error/http-error.class";

export class AuthGuard implements IMiddleware {
	execute(req: Request, res: Response, next: NextFunction): void {
		if(req.user) {
			return next()
		} else {
			return next(new HttpError(401, "You are not authorized"))
		}
	}
}
