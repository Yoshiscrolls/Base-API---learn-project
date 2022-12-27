import { IUserRepository } from "./user-repository-interface";
import { inject, injectable } from "inversify";
import { UserModel } from "@prisma/client";
import { TYPES } from "../types";
import { DatabaseService } from "../database/database-service";
import { User } from "./user-entity";


@injectable()
export class UserRepository implements IUserRepository {
	constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {
	}

	async create({ email, password, name }: User): Promise<UserModel> {
		return this.databaseService.client.userModel.create({
			data: {
				email,
				name,
				password,
			},
		});
	}

	async find(email: string): Promise<UserModel | null> {
		return this.databaseService.client.userModel.findFirst({
			where: {
				email,
			},
		});
	}
}
