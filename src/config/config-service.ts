import { IConfigService } from "./config-service-interface";
import { DotenvParseOutput, config, DotenvConfigOutput } from "dotenv";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { ILogger } from "../logger/logger.interface";

@injectable()
export class ConfigService implements IConfigService {
	private config: DotenvParseOutput;

	constructor(@inject(TYPES.ILogger) private logger: ILogger) {
		const result: DotenvConfigOutput = config();
		if (result.error) {
			this.logger.error("Can`t read file .env or not found");
		} else {
			this.logger.log('Config upload')
			this.config = result.parsed;
		}
	}

	get(key: string): string {
		return this.config[key];
	}
}
