import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Team } from './team.entity';
import { User } from 'src/user/user.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { NotificationsGateway } from 'src/notification/notification.gateway';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationService: NotificationService,
  ) {}

  /** CREATE TEAM */
  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const team = this.teamRepository.create({
      name: createTeamDto.name,
      description: createTeamDto.description,
    });
    await this.teamRepository.save(team);

    // Add PMs
    if (createTeamDto.pms?.length) {
      await this.teamRepository
        .createQueryBuilder()
        .relation(Team, 'pms')
        .of(team.id)
        .add(createTeamDto.pms);
    }

    // Add secondary members (Many-to-Many)
    if (createTeamDto.secondaryMembers?.length) {
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'secondaryTeams')
        .of(createTeamDto.secondaryMembers)
        .add(team.id);

      // Notify secondary members
      for (const userId of createTeamDto.secondaryMembers) {
        const notification = {
          title: 'Assigned to a new team',
          message: `You have been added to team "${team.name}".`,
          read_status: false,
        };
        this.notificationsGateway.sendNotification(
          userId.toString(),
          notification as any,
        );
      }
    }

    // Set main members (Many-to-One)
    if (createTeamDto.members?.length) {
      await this.userRepository.update(createTeamDto.members, { team: team });

      // Notify main members
      for (const userId of createTeamDto.members) {
        const notification = {
          title: 'Assigned to a new main team',
          message: `You have been assigned to team "${team.name}" as your main team.`,
          read_status: false,
        };
        this.notificationsGateway.sendNotification(
          userId.toString(),
          notification as any,
        );
      }
    }

    return this.teamRepository.findOneOrFail({
      where: { id: team.id },
      relations: ['pms', 'members', 'mainMembers', 'projects'],
    });
  }

  /** GET ALL TEAMS */
  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({
      relations: ['pms', 'members', 'mainMembers', 'projects'],
    });
  }

  /** GET ONE TEAM */
  async findOne(id: number): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['pms', 'members', 'mainMembers', 'projects'],
    });
    if (!team) throw new NotFoundException(`Team with ID ${id} not found`);
    return team;
  }

  /** UPDATE TEAM */
  async update(id: number, dto: UpdateTeamDto): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['pms', 'members', 'mainMembers'], // load current members for filtering
    });
    if (!team) throw new NotFoundException(`Team with ID ${id} not found`);

    // --- Update name ---
    if (dto.name || dto.description) {
      await this.teamRepository.update(id, {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
      });
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

    // --- Main Members (One-to-Many) ---
    if (dto.addMembers?.length) {
      for (const userId of dto.addMembers) {
        await this.userRepository.update(userId, { team: team });

        // Notify added main members
        const notification = {
          title: 'Assigned to a new main team',
          message: `You have been assigned to team "${team.name}" as your main team.`,
          read_status: false,
        };
        this.notificationsGateway.sendNotification(
          userId.toString(),
          notification as any,
        );
      }
    }

    if (dto.removeMembers?.length) {
      await this.userRepository.update(dto.removeMembers, {
        team: null as any,
      });

      // Notify removed main members
      for (const userId of dto.removeMembers) {
        const notification = {
          title: 'Removed from main team',
          message: `You have been removed from team "${team.name}".`,
          read_status: false,
        };
        this.notificationsGateway.sendNotification(
          userId.toString(),
          notification as any,
        );
      }
    }

    // --- Secondary members ---
    if (dto.addSecondaryMembers?.length) {
      for (const userId of dto.addSecondaryMembers) {
        await this.userRepository
          .createQueryBuilder()
          .relation(User, 'secondaryTeams')
          .of(userId)
          .add(team.id);

        // Notify added secondary members
        const notification = {
          title: 'Assigned to a new team',
          message: `You have been added to team "${team.name}".`,
          read_status: false,
        };
        this.notificationsGateway.sendNotification(
          userId.toString(),
          notification as any,
        );
      }
    }

    if (dto.removeSecondaryMembers?.length) {
      for (const userId of dto.removeSecondaryMembers) {
        await this.userRepository
          .createQueryBuilder()
          .relation(User, 'secondaryTeams')
          .of(userId)
          .remove(team.id);

        // Notify removed secondary members
        const notification = {
          title: 'Removed from team',
          message: `You have been removed from team "${team.name}".`,
          read_status: false,
        };
        this.notificationsGateway.sendNotification(
          userId.toString(),
          notification as any,
        );
      }
    }

    // Return updated team with relations
    const updatedTeam = await this.teamRepository.findOneOrFail({
      where: { id: team.id },
      relations: ['pms', 'members', 'mainMembers', 'projects'],
    });

    return updatedTeam;
  }

  /** DELETE TEAM */
  async remove(id: number): Promise<void> {
    const team = await this.findOne(id);
    await this.teamRepository.remove(team);
  }
}
