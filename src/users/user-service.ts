import { IUserService } from "./user-service-interface";
import { UserRegisterDto } from "./dto/user-register-dto";
import { User } from "./user-entity";
import { UserLoginDto } from "./dto/user-login-dto";
import { inject, injectable } from "inversify";
import { IConfigService } from "../config/config-service-interface";
import { TYPES } from "../types";
import { IUserRepository } from "./user-repository-interface";
import { UserModel } from "@prisma/client";

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(TYPES.UserRepository) private userRepository: IUserRepository,
		@inject(TYPES.ConfigService) private configService: IConfigService,
	) {
	}

	async createUser({ email, name, password }: UserRegisterDto): Promise<UserModel | null> {
		const newUser = new User(email, name);
		const salt = this.configService.get("SALT");
		await newUser.setPassword(password, Number(salt));
		const existedUser = await this.userRepository.find(email);
		if (existedUser) {
			return null;
		}
		return this.userRepository.create(newUser);
	}

	async validateUser({ email, password }: UserLoginDto): Promise<boolean> {
		const existedUser = await this.userRepository.find(email);
		if (!existedUser) {
			return false;
		}
		const newUser = new User(existedUser.email, existedUser.name, existedUser.password);
		const res = newUser.comparePassword(password);
		if (res) {
			return true;
		}
	}

	async getUserInfo(email: string): Promise<UserModel | null> {
		return this.userRepository.find(email);
	}
}
