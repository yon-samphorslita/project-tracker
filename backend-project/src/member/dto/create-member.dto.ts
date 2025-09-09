import { IsEnum, IsInt, IsNotEmpty, IsNumber } from "class-validator";
import { Role } from "src/enums/role.enum";

export class CreateMemberDto {
    @IsEnum(Role)
    role: Role;

    @IsNumber()
    @IsNotEmpty()
    teamId: number;

    @IsNumber()
    @IsNotEmpty()
    userId: number;

}
