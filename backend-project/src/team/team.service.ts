import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './team.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { promises } from 'dns';
import { User } from 'src/user/user.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const team = this.teamRepository.create({
      name: createTeamDto.name,
    });

    // If PMs are provided
    if (createTeamDto.pms?.length) {
      team.pms = await this.userRepository.find({
        where: { id: In(createTeamDto.pms) },
      });
    }

    // If members are provided
    if (createTeamDto.members?.length) {
      team.members = await this.userRepository.find({
        where: { id: In(createTeamDto.members) },
      });
    }

    await this.teamRepository.save(team);

    return this.teamRepository.findOneOrFail({
      where: { id: team.id },
      relations: ['pms', 'members', 'projects'],
    });
  }

  // returns all teams, including their members & projects.
  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({
      relations: ['pms', 'members', 'projects'],
    });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['pms', 'members', 'projects'],
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto): Promise<Team> {
    // const team = await this.findOne(id);
    // Object.assign(team, updateTeamDto);
    // return this.teamRepository.save(team);

    const team = await this.findOne(id);

    if (updateTeamDto.name !== undefined) {
      team.name = updateTeamDto.name;
    }

    if (updateTeamDto.pms !== undefined) {
      team.pms = await this.userRepository.find({
        where: { id: In(updateTeamDto.pms) },
      });
    }

    if (updateTeamDto.members !== undefined) {
      team.members = await this.userRepository.find({
        where: { id: In(updateTeamDto.members) },
      });
    }

    await this.teamRepository.save(team);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const team = await this.findOne(id);
    await this.teamRepository.remove(team);
  }
}
