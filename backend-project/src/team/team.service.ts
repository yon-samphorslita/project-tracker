import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Team } from './team.entity';
import { User } from 'src/user/user.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { NotificationsGateway } from 'src/notification/notification.gateway';
import { NotificationService } from 'src/notification/notification.service';
import { ActivityService } from 'src/activity/activity.service';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationService: NotificationService,
    private readonly activityService: ActivityService,
  ) {}

  /** CREATE TEAM */
  async create(createTeamDto: CreateTeamDto, userId: number): Promise<Team> {
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

    // Add secondary members
    let secondaryNames = 'none';
    if (createTeamDto.secondaryMembers?.length) {
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'secondaryTeams')
        .of(createTeamDto.secondaryMembers)
        .add(team.id);

      const secondaryUsers = await this.userRepository.findBy({ id: In(createTeamDto.secondaryMembers) });
      secondaryNames = secondaryUsers.map(u => `${u.first_name} ${u.last_name}`).join(', ');

      for (const uid of createTeamDto.secondaryMembers) {
        const notification = {
          title: 'Assigned to a new team',
          message: `You have been added to team "${team.name}".`,
          read_status: false,
        };
        this.notificationsGateway.sendNotification(uid.toString(), notification as any);
      }
    }

    // Add main members
    let mainNames = 'none';
    if (createTeamDto.members?.length) {
      await this.userRepository.update(createTeamDto.members, { team: team });

      const mainUsers = await this.userRepository.findBy({ id: In(createTeamDto.members) });
      mainNames = mainUsers.map(u => `${u.first_name} ${u.last_name}`).join(', ');

      for (const uid of createTeamDto.members) {
        const notification = {
          title: 'Assigned to a new main team',
          message: `You have been assigned to team "${team.name}" as your main team.`,
          read_status: false,
        };
        this.notificationsGateway.sendNotification(uid.toString(), notification as any);
      }
    }

    // PMs names
    let pmNames = 'none';
    if (createTeamDto.pms?.length) {
      const pmUsers = await this.userRepository.findBy({ id: In(createTeamDto.pms) });
      pmNames = pmUsers.map(u => `${u.first_name} ${u.last_name}`).join(', ');
    }

    // Log activity
    await this.activityService.logAction(
      userId,
      `Created team "${team.name}" with PMs: ${pmNames}, main members: ${mainNames}, secondary members: ${secondaryNames}.`
    );

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
  async update(id: number, dto: UpdateTeamDto, userId: number): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['pms', 'members', 'mainMembers'],
    });
    if (!team) throw new NotFoundException(`Team with ID ${id} not found`);

    const changes: string[] = [];

    if (dto.name && dto.name !== team.name) {
      changes.push(`Name: "${team.name}" → "${dto.name}"`);
      team.name = dto.name;
    }
    if (dto.description && dto.description !== team.description) {
      changes.push(`Description updated`);
      team.description = dto.description;
    }

    // PMs
    if (dto.addPms?.length) {
      await this.teamRepository
        .createQueryBuilder()
        .relation(Team, 'pms')
        .of(team.id)
        .add(dto.addPms);

      const addedPms = await this.userRepository.findBy({ id: In(dto.addPms) });
      changes.push(`Added PMs: ${addedPms.map(u => `${u.first_name} ${u.last_name}`).join(', ')}`);
    }
    if (dto.removePms?.length) {
      await this.teamRepository
        .createQueryBuilder()
        .relation(Team, 'pms')
        .of(team.id)
        .remove(dto.removePms);

      const removedPms = await this.userRepository.findBy({ id: In(dto.removePms) });
      changes.push(`Removed PMs: ${removedPms.map(u => `${u.first_name} ${u.last_name}`).join(', ')}`);
    }

    // Main members
    if (dto.addMembers?.length) {
      await this.userRepository.update(dto.addMembers, { team: team });
      const addedMembers = await this.userRepository.findBy({ id: In(dto.addMembers) });
      changes.push(`Added main members: ${addedMembers.map(u => `${u.first_name} ${u.last_name}`).join(', ')}`);

      for (const uid of dto.addMembers) {
        const notification = {
          title: 'Assigned to a new main team',
          message: `You have been assigned to team "${team.name}" as your main team.`,
          read_status: false,
        };
        this.notificationsGateway.sendNotification(uid.toString(), notification as any);
      }
    }
    if (dto.removeMembers?.length) {
      await this.userRepository.update(dto.removeMembers, { team: null as any });
      const removedMembers = await this.userRepository.findBy({ id: In(dto.removeMembers) });
      changes.push(`Removed main members: ${removedMembers.map(u => `${u.first_name} ${u.last_name}`).join(', ')}`);

      for (const uid of dto.removeMembers) {
        const notification = {
          title: 'Removed from main team',
          message: `You have been removed from team "${team.name}".`,
          read_status: false,
        };
        this.notificationsGateway.sendNotification(uid.toString(), notification as any);
      }
    }

    // Secondary members
    if (dto.addSecondaryMembers?.length) {
      for (const uid of dto.addSecondaryMembers) {
        await this.userRepository
          .createQueryBuilder()
          .relation(User, 'secondaryTeams')
          .of(uid)
          .add(team.id);
      }
      const addedSecondary = await this.userRepository.findBy({ id: In(dto.addSecondaryMembers) });
      changes.push(`Added secondary members: ${addedSecondary.map(u => `${u.first_name} ${u.last_name}`).join(', ')}`);
    }
    if (dto.removeSecondaryMembers?.length) {
      for (const uid of dto.removeSecondaryMembers) {
        await this.userRepository
          .createQueryBuilder()
          .relation(User, 'secondaryTeams')
          .of(uid)
          .remove(team.id);
      }
      const removedSecondary = await this.userRepository.findBy({ id: In(dto.removeSecondaryMembers) });
      changes.push(`Removed secondary members: ${removedSecondary.map(u => `${u.first_name} ${u.last_name}`).join(', ')}`);
    }

    await this.teamRepository.save(team);

    if (changes.length > 0) {
      await this.activityService.logAction(userId, `Updated team "${team.name}": ${changes.join('; ')}`);
    }

    return this.teamRepository.findOneOrFail({
      where: { id: team.id },
      relations: ['pms', 'members', 'mainMembers', 'projects'],
    });
  }

  /** DELETE TEAM */
  async remove(id: number, userId: number): Promise<void> {
    const team = await this.findOne(id);
    await this.teamRepository.remove(team);

    // Log activity
    await this.activityService.logAction(userId, `Deleted team "${team.name}"`);
  }
}
