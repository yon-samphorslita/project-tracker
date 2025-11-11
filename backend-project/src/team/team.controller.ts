import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './team.entity';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/enums/role.enum';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  // Anyone can view teams
  @Get()
  findAll(): Promise<Team[]> {
    return this.teamService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Team> {
    return this.teamService.findOne(+id);
  }

  // Only ADMIN or PROJECT_MANAGER can create teams
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @Post()
  create(@Body() createTeamDto: CreateTeamDto, @Req() req): Promise<Team> {
    return this.teamService.create(createTeamDto, req.user.id);
  }

  // Only ADMIN or PROJECT_MANAGER can update teams
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeamDto: UpdateTeamDto,
    @Req() req,
  ): Promise<Team> {
    return this.teamService.update(id, updateTeamDto, req.user.id);
  }

  // Only ADMIN can delete teams
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req): Promise<void> {
    return this.teamService.remove(+id, req.user.id);
  }
}
