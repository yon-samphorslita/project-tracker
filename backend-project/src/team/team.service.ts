import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Team } from './team.entity';
import { User } from 'src/user/user.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /** CREATE TEAM */
  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const team = this.teamRepository.create({ name: createTeamDto.name });
    await this.teamRepository.save(team);

    // Add PMs
    if (createTeamDto.pms?.length) {
      await this.teamRepository
        .createQueryBuilder()
        .relation(Team, 'pms')
        .of(team.id)
        .add(createTeamDto.pms);
    }

    // Add Members (update User.team)
    if (createTeamDto.members?.length) {
      await this.userRepository.update(createTeamDto.members, { team: team });
    }

    return this.teamRepository.findOneOrFail({
      where: { id: team.id },
      relations: ['pms', 'members', 'projects'],
    });
  }

  /** GET ALL TEAMS */
  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({
      relations: [
        'pms',
        'members',
        'projects',
        'projects.tasks',
        'projects.tasks.subtasks',
      ],
    });
  }

  /** GET ONE TEAM */
  async findOne(id: number): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['pms', 'members', 'projects'],
    });
    if (!team) throw new NotFoundException(`Team with ID ${id} not found`);
    return team;
  }

  /** UPDATE TEAM */
  async update(id: number, dto: UpdateTeamDto): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['pms', 'members'], // load current members for filtering
    });
    if (!team) throw new NotFoundException(`Team with ID ${id} not found`);

    // --- Update name ---
    if (dto.name) {
      await this.teamRepository.update(id, { name: dto.name });
    }

    // --- PMs (Many-to-Many) ---
    if (dto.addPms?.length) {
      await this.teamRepository
        .createQueryBuilder()
        .relation(Team, 'pms')
        .of(team.id)
        .add(dto.addPms);
    }
    if (dto.removePms?.length) {
      await this.teamRepository
        .createQueryBuilder()
        .relation(Team, 'pms')
        .of(team.id)
        .remove(dto.removePms);
    }

    // --- Members (One-to-Many) ---
    // Add members: set their team
    if (dto.addMembers?.length) {
      await this.userRepository.update(dto.addMembers, { team: team });
    }

    // Remove members: set user's team to null
    if (dto.removeMembers?.length) {
      await this.userRepository.update(dto.removeMembers, {
        team: null as any,
      });
    }

    // Return updated team with relations
    const updatedTeam = await this.teamRepository.findOneOrFail({
      where: { id: team.id },
      relations: ['pms', 'members', 'projects'],
    });

    return updatedTeam;
  }

  /** DELETE TEAM */
  async remove(id: number): Promise<void> {
    const team = await this.findOne(id);
    await this.teamRepository.remove(team);
  }
}
