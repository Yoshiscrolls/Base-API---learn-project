import { IsEmail, IsString } from "class-validator";

export class UserRegisterDto {
	@IsEmail({}, {message: 'Incorrect e-mail'})
	email: string;

	@IsString({message: 'Incorrect password'})
	password: string;

	@IsString({message: 'Incorrect name'})
	name: string;
}
