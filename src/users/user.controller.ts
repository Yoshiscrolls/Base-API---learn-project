import { BaseController } from "../common/base.controller";
import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { ILogger } from "../logger/logger.interface";
import "reflect-metadata";
import { IUserController } from "./user-controller-interface";
import { UserRegisterDto } from "./dto/user-register-dto";
import { UserLoginDto } from "./dto/user-login-dto";
import { HttpError } from "../error/http-error.class";
import { ValidateMiddleware } from "../common/validate-middleware";
import { IUserService } from "./user-service-interface";
import { sign } from "jsonwebtoken";
import { IConfigService } from "../config/config-service-interface";
import { AuthGuard } from "../common/auth-guard";

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(
		@inject(TYPES.ILogger) private readonly loggerService: ILogger,
		@inject(TYPES.UserService) private readonly userService: IUserService,
		@inject(TYPES.ConfigService) private readonly configService: IConfigService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: "/register",
				method: "post",
				func: this.register,
				middlewares: [new ValidateMiddleware(UserRegisterDto)],
			},
			{
				path: "/login",
				method: "post",
				func: this.login,
				middlewares: [new ValidateMiddleware(UserLoginDto)],
			},
			{
				path: "/info",
				method: "get",
				func: this.info,
				middlewares: [new AuthGuard()],
			},
		]);
	}

	async register(
		{ body }: Request<Record<string, unknown>, Record<string, unknown>, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userService.createUser(body);
		if (!result) {
			return next(new HttpError(422, "This user is already created"));
		}
		this.ok(res, { email: result.email, id: result.id });
	}

	async login(
		req: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userService.validateUser(req.body);
		if (!result) {
			return next(new HttpError(401, "Login error"));
		}
		const jwt = await this.signJWT(req.body.email, this.configService.get("SECRET"));
		this.ok(res, { jwt });
	}

	 async info({ user }: Request, res: Response, next: NextFunction): Promise<void> {
		const userInfo = await this.userService.getUserInfo(user)
		this.ok(res, {  id: userInfo?.id, name: userInfo?.name, email: userInfo?.email });
	}

	private signJWT(email: string, secret: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					iat: Math.floor(Date.now() / 1000),
				},
				secret,
				{
					algorithm: "HS256",
				},
				(err, token) => {
					if (err) {
						reject(err);
					}
					resolve(token as string);
				},
			);
		});
	}
}
