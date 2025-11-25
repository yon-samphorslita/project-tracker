import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  projects?: never;
  tasks?: never;
  events?: never;
  notifications?: never;
  activities?: never;
  team?: never;
  pmTeams?: never;
  secondaryTeams?: never;
}
