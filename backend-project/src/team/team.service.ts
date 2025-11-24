import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const existing = await this.teamRepository.findOne({
      where: { name: createTeamDto.name },
    });
    if (existing) {
      throw new BadRequestException('Team name must be unique');
    }

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

      for (const pmId of createTeamDto.pms) {
        await this.notificationService.create({
          userId: pmId,
          title: 'Project Manager Role Assigned',
          message: `You have been added as a Project Manager to the team "${team.name}". You can now manage projects and tasks within this team.`,
          read_status: false,
          link: `/teams/${team.id}`,
        });
      }
      console.log('notification: ', this.notificationService.findOne(team.id));
    }

    // --- Add secondary members ---
    if (createTeamDto.secondaryMembers?.length) {
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'secondaryTeams')
        .of(createTeamDto.secondaryMembers)
        .add(team.id);

      // Notify secondary members
      for (const uid of createTeamDto.secondaryMembers) {
        await this.notificationService.create({
          userId: uid,
          title: 'Secondary Member Role Assigned',
          message: `You were added as a secondary member to team "${team.name}". You can now participate in its projects and tasks.`,
          read_status: false,
          link: `/teams/${team.id}`,
        });
      }
    }

    // --- Add main members ---
    if (createTeamDto.members?.length) {
      await this.userRepository.update(createTeamDto.members, { team });

      // Notify main members
      for (const uid of createTeamDto.members) {
        const notification = await this.notificationService.create({
          userId: uid,
          title: 'Main Member Role Assigned',
          message: `You were added as a main member to team "${team.name}". You can now participate in its projects and tasks.`,
          read_status: false,
          link: `/teams/${team.id}`,
        });
        console.log('link: ', `/teams/${team.id}`);
        // this.notificationsGateway.sendNotification(String(uid), notification);
      }
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

    if (dto.name && dto.name !== team.name) {
      const existing = await this.teamRepository.findOne({
        where: { name: dto.name },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException('Team name must be unique');
      }
    }

    const getFullNames = async (ids?: number[]) => {
      if (!ids?.length) return '';
      const users = await this.userRepository.findBy({ id: In(ids) });
      return users.map((u) => `${u.first_name} ${u.last_name}`).join(', ');
    };

    // --- Name / Description ---
    if (dto.name && dto.name !== team.name) {
      actions.push(`Changed name from "${team.name}" to "${dto.name}"`);

      // Notify all team members about name change
      const allUserIds = [
        ...team.pms.map((u) => u.id),
        ...team.mainMembers.map((u) => u.id),
        ...team.members.map((u) => u.id),
      ];

      await this.notificationService.notifyUsers(
        allUserIds,
        'Team Information Updated',
        `The team "${team.name}" has changed its name to "${dto.name}".`,
        `/teams/${team.id}`,
      );

      await this.teamRepository.update(id, { name: dto.name });
      team.name = dto.name;
    }

    if (dto.description && dto.description !== team.description) {
      actions.push(
        `Changed description from "${team.description}" to "${dto.description}"`,
      );

      // Notify all team members about description change
      const allUserIds = [
        ...team.pms.map((u) => u.id),
        ...team.mainMembers.map((u) => u.id),
        ...team.members.map((u) => u.id),
      ];

      await this.notificationService.notifyUsers(
        allUserIds,
        'Team Information Updated',
        `The team "${team.name}" has updated its description.`,
        `/teams/${team.id}`,
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

        // Notify added PMs
        for (const uid of actuallyAdded) {
          await this.notificationService.create({
            userId: uid,
            title: 'Added as Project Manager',
            message: `You were added as a Project Manager to team "${team.name}". You can now manage projects and tasks within this team.`,
            read_status: false,
            link: `/teams/${team.id}`,
          });
        }
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

        await this.notificationService.notifyUsers(
          actuallyRemoved,
          'Removed as Project Manager',
          `You have been removed as PM from team "${team.name}".`,
          `/teams`,
        );
      }
    }

    // --- Main Members ---
    if (dto.addMembers?.length) {
      const currentMemberIds = team.mainMembers.map((u) => u.id);
      const actuallyAdded = dto.addMembers.filter(
        (id) => !currentMemberIds.includes(id),
      );
      if (actuallyAdded.length) {
        const addedNames = await getFullNames(actuallyAdded);
        actions.push(`Added main members: ${addedNames}`);
        await this.userRepository.update(actuallyAdded, { team });

        for (const userId of actuallyAdded) {
          await this.notificationService.create({
            userId,
            title: 'Added as Main Member',
            message: `You were added as a main member to team "${team.name}". You can now participate in its projects and tasks.`,
            read_status: false,
            link: `/teams/${team.id}`,
          });
        }
      }
    }

    if (dto.removeMembers?.length) {
      const currentMemberIds = team.mainMembers.map((u) => u.id);
      const actuallyRemoved = dto.removeMembers.filter((id) =>
        currentMemberIds.includes(id),
      );
      if (actuallyRemoved.length) {
        const removedNames = await getFullNames(actuallyRemoved);
        actions.push(`Removed main members: ${removedNames}`);
        await this.userRepository.update(actuallyRemoved, {
          team: null as any,
        });

        for (const userId of actuallyRemoved) {
          await this.notificationService.create({
            userId,
            title: 'Removed from Team',
            message: `You were removed as a main member to team "${team.name}".`,
            read_status: false,
            link: `/teams/${team.id}`,
          });
        }
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

        for (const uid of actuallyAdded) {
          await this.notificationService.create({
            userId: uid,
            title: 'Added as Secondary Member',
            message: `You were added as a Secondary Member to team "${team.name}".`,
            read_status: false,
            link: `/teams/${team.id}`,
          });
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

        await this.notificationService.notifyUsers(
          actuallyRemoved,
          'Team Update',
          `You have been removed as a Secondary Member from team "${team.name}".`,
          `/teams`,
        );
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

    const allUserIds = [
      ...team.pms.map((u) => u.id),
      ...team.mainMembers.map((u) => u.id),
      ...team.members.map((u) => u.id),
    ];

    await this.notificationService.notifyUsers(
      allUserIds,
      'Team deleted',
      `The team "${team.name}" has been deleted.`,
      `/teams`,
    );

    await this.teamRepository.remove(team);
    await this.activityService.logAction(userId, `Deleted team "${team.name}"`);
  }
}
