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

    // --- Add PMs ---
    if (createTeamDto.pms?.length) {
      await this.teamRepository
        .createQueryBuilder()
        .relation(Team, 'pms')
        .of(team.id)
        .add(createTeamDto.pms);
    }

    // --- Add secondary members ---
    if (createTeamDto.secondaryMembers?.length) {
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'secondaryTeams')
        .of(createTeamDto.secondaryMembers)
        .add(team.id);
    }

    // --- Add main members ---
    if (createTeamDto.members?.length) {
      await this.userRepository.update(createTeamDto.members, { team });
    }

    // --- Log Activity using full names ---
    const getFullNames = async (ids?: number[]) => {
      if (!ids?.length) return 'none';
      const users = await this.userRepository.findBy({ id: In(ids) });
      return users.map((u) => `${u.first_name} ${u.last_name}`).join(', ');
    };

    const pmsList = await getFullNames(createTeamDto.pms);
    const mainList = await getFullNames(createTeamDto.members);
    const secondaryList = await getFullNames(createTeamDto.secondaryMembers);

    await this.activityService.logAction(
      userId,
      `Created team "${team.name}" with PMs: ${pmsList}, main members: ${mainList}, secondary members: ${secondaryList}.`,
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
    const team = await this.findOne(id);
    const actions: string[] = [];

    const getFullNames = async (ids?: number[]) => {
      if (!ids?.length) return '';
      const users = await this.userRepository.findBy({ id: In(ids) });
      return users.map((u) => `${u.first_name} ${u.last_name}`).join(', ');
    };

    // --- Name / Description ---
    if (dto.name && dto.name !== team.name) {
      actions.push(`Changed name from "${team.name}" → "${dto.name}"`);
      await this.teamRepository.update(id, { name: dto.name });
      team.name = dto.name;
    }

    if (dto.description && dto.description !== team.description) {
      actions.push(
        `Changed description from "${team.description}" → "${dto.description}"`,
      );
      await this.teamRepository.update(id, { description: dto.description });
      team.description = dto.description;
    }

    // --- PMs ---
    if (dto.addPms?.length) {
      const currentPmsIds = team.pms.map((u) => u.id);
      const actuallyAdded = dto.addPms.filter(
        (id) => !currentPmsIds.includes(id),
      );
      if (actuallyAdded.length) {
        await this.teamRepository
          .createQueryBuilder()
          .relation(Team, 'pms')
          .of(team.id)
          .add(actuallyAdded);
        const addedNames = await getFullNames(actuallyAdded);
        actions.push(`Added PMs: ${addedNames}`);
      }
    }

    if (dto.removePms?.length) {
      const currentPmsIds = team.pms.map((u) => u.id);
      const actuallyRemoved = dto.removePms.filter((id) =>
        currentPmsIds.includes(id),
      );
      if (actuallyRemoved.length) {
        await this.teamRepository
          .createQueryBuilder()
          .relation(Team, 'pms')
          .of(team.id)
          .remove(actuallyRemoved);
        const removedNames = await getFullNames(actuallyRemoved);
        actions.push(`Removed PMs: ${removedNames}`);
      }
    }

    // --- Main Members ---
    if (dto.addMembers?.length) {
      const currentMemberIds = team.members.map((u) => u.id);
      const actuallyAdded = dto.addMembers.filter(
        (id) => !currentMemberIds.includes(id),
      );
      if (actuallyAdded.length) {
        const addedNames = await getFullNames(actuallyAdded);
        actions.push(`Added main members: ${addedNames}`);
        await this.userRepository.update(actuallyAdded, { team });
      }
    }

    if (dto.removeMembers?.length) {
      const currentMemberIds = team.members.map((u) => u.id);
      const actuallyRemoved = dto.removeMembers.filter((id) =>
        currentMemberIds.includes(id),
      );
      if (actuallyRemoved.length) {
        const removedNames = await getFullNames(actuallyRemoved);
        actions.push(`Removed main members: ${removedNames}`);
        await this.userRepository.update(actuallyRemoved, {
          team: null as any,
        });
      }
    }

    // --- Secondary Members ---
    if (dto.addSecondaryMembers?.length) {
      const currentSecondaryIds = team.members.map((u) => u.id);
      const actuallyAdded = dto.addSecondaryMembers.filter(
        (id) => !currentSecondaryIds.includes(id),
      );
      if (actuallyAdded.length) {
        const addedNames = await getFullNames(actuallyAdded);
        actions.push(`Added secondary members: ${addedNames}`);
        for (const uid of actuallyAdded) {
          await this.userRepository
            .createQueryBuilder()
            .relation(User, 'secondaryTeams')
            .of(uid)
            .add(team.id);
        }
      }
    }

    if (dto.removeSecondaryMembers?.length) {
      const currentSecondaryIds = team.members.map((u) => u.id);
      const actuallyRemoved = dto.removeSecondaryMembers.filter((id) =>
        currentSecondaryIds.includes(id),
      );
      if (actuallyRemoved.length) {
        const removedNames = await getFullNames(actuallyRemoved);
        actions.push(`Removed secondary members: ${removedNames}`);
        for (const uid of actuallyRemoved) {
          await this.userRepository
            .createQueryBuilder()
            .relation(User, 'secondaryTeams')
            .of(uid)
            .remove(team.id);
        }
      }
    }

    // --- Log only real changes ---
    if (actions.length) {
      await this.activityService.logAction(
        userId,
        `Updated team "${team.name}": ${actions.join('; ')}`,
      );
    }

    return this.findOne(id);
  }

  /** DELETE TEAM */
  async remove(id: number, userId: number): Promise<void> {
    const team = await this.findOne(id);
    await this.teamRepository.remove(team);
    await this.activityService.logAction(userId, `Deleted team "${team.name}"`);
  }
}
