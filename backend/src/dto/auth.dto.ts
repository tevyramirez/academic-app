import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";

export class RegisterUserDto {
  @IsEmail({}, { message: "Invalid email format" })
  email!: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password!: string;

  @IsString()
  @IsOptional()
  name?: string;
}

export class LoginUserDto {
  @IsEmail({}, { message: "Invalid email format" })
  email!: string;

  @IsString()
  password!: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password?: string;

  @IsOptional()
  preferences?: any;
}
