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
import { AuthGuard } from '@nestjs/passport';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './team.entity';
import { Request } from 'express';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/auth/roles.guard';

// Define a typed request with user
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email?: string;
    role?: string;
  };
}

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}
  
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @Post()
  create(@Body() createTeamDto: CreateTeamDto, @Req() req: AuthenticatedRequest): Promise<Team> {
    return this.teamService.create(createTeamDto, req.user.id);
  }

  @Get()
  findAll(): Promise<Team[]> {
    return this.teamService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Team> {
    return this.teamService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeamDto: UpdateTeamDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Team> {
    const userId = req.user.id;
    return this.teamService.update(id, updateTeamDto, userId);
  }

  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest): Promise<void> {
    const userId = req.user.id;
    return this.teamService.remove(id, userId);
  }
}
