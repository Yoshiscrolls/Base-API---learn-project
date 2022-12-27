import express, { Express } from "express";
import { Server } from "http";
import { inject, injectable } from "inversify";
import { TYPES } from "./types";
import { json } from "body-parser";
import "reflect-metadata";
import { ILogger } from "./logger/logger.interface";
import { UserController } from "./users/user.controller";
import { ExceptionFilter } from "./error/exception.filter";
import { IConfigService } from "./config/config-service-interface";
import { DatabaseService } from "./database/database-service";
import { AuthMiddleware } from "./common/auth-middleware";


@injectable()
export class App {
	app: Express;
	server = Server;
	port: number;
	logger: ILogger;

	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.UserController) private userController: UserController,
		@inject(TYPES.ExceptionFilter) private exceptionFilter: ExceptionFilter,
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.DatabaseService) private databaseService: DatabaseService,
	) {
		this.app = express();
		this.port = 8000;
	}

	useMiddlewares(): void {
		this.app.use(json());
		const authMiddleware = new AuthMiddleware(this.configService.get("SECRET"));
		this.app.use(authMiddleware.execute.bind(authMiddleware));
	}

	useRoutes(): void {
		this.app.use("/users", this.userController.router);
	}

	useExceptions(): void {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
	}

	public async init(): Promise<void> {
		this.useMiddlewares();
		this.useRoutes();
		this.useExceptions();
		await this.databaseService.connect();
		this.server = this.app.listen(this.port);
	}
}
