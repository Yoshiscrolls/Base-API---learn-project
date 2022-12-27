import { App } from "./app";
import { LoggerService } from "./logger/logger.service";
import { UserController } from "./users/user.controller";
import { ExceptionFilter } from "./error/exception.filter";
import { Container, ContainerModule, type interfaces } from "inversify";
import { type ILogger } from "./logger/logger.interface";
import { TYPES } from "./types";
import { type IExceptionFilter } from "./error/exception.interface";
import { UserService } from "./users/user-service";
import { IUserService } from "./users/user-service-interface";
import { IUserController } from "./users/user-controller-interface";
import { IConfigService } from "./config/config-service-interface";
import { ConfigService } from "./config/config-service";
import { DatabaseService } from "./database/database-service";
import { UserRepository } from "./users/user-repository-service";
import { IUserRepository } from "./users/user-repository-interface";


export type IStartAppReturn = {
	appContainer: Container;
	app: App;
};

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
	bind<IExceptionFilter>(TYPES.ExceptionFilter).to(ExceptionFilter);
	bind<IUserController>(TYPES.UserController).to(UserController);
	bind<IUserService>(TYPES.UserService).to(UserService);
	bind<App>(TYPES.Application).to(App);
	bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();
	bind<DatabaseService>(TYPES.DatabaseService).to(DatabaseService).inSingletonScope();
	bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
});

const startApp = (): IStartAppReturn => {
	const appContainer = new Container();
	appContainer.load(appBindings);
	const app = appContainer.get<App>(TYPES.Application);
	app.init();
	return { app, appContainer };
};

export const { app, appContainer } = startApp();

