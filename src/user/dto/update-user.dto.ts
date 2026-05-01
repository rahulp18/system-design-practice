import { IsEmail, IsOptional, IsString } from 'class-validator';
export class UpdateUserDTO {
  @IsString()
  @IsOptional()
  name?: string;
  @IsEmail()
  @IsOptional()
  email?: string;
}
