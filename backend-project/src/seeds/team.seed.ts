import { DataSource } from 'typeorm';
import { Team } from '../team/team.entity';
import { User } from '../user/user.entity';
import { Role } from 'src/enums/role.enum';

export const seedTeams = async (dataSource: DataSource) => {
  const teamRepo = dataSource.getRepository(Team);
  const userRepo = dataSource.getRepository(User);

  // Fetch some users to assign as PMs or members
  const admin = await userRepo.findOne({ where: { role: Role.ADMIN } });
  const pm = await userRepo.findOne({ where: { role: Role.PROJECT_MANAGER } });
  const member = await userRepo.findOne({ where: { role: Role.MEMBER } });

  if (!admin || !pm || !member) {
    console.warn('Some users not found, make sure users are seeded first.');
  }

  const teams = [
    {
      name: 'Team Database',
      description: 'First team',
      pms: pm ? [pm] : [],
      members: member ? [member] : [],
    },
    {
      name: 'Team Research',
      description: 'Second team',
      pms: pm ? [pm] : [],
      members: member ? [member] : [],
    },
  ];

  for (const t of teams) {
    const existing = await teamRepo.findOne({ where: { name: t.name } });
    if (existing) continue;

    const team = teamRepo.create(t);
    await teamRepo.save(team);
    console.log(`Team ${t.name} created`);
  }
};
