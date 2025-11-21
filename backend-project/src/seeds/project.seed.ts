import { DataSource, In } from 'typeorm';
import { Project } from '../project/project.entity';
import { User } from '../user/user.entity';
import { Team } from '../team/team.entity';
import { Role } from 'src/enums/role.enum';

export const seedProjects = async (dataSource: DataSource) => {
  const projectRepo = dataSource.getRepository(Project);
  const userRepo = dataSource.getRepository(User);
  const teamRepo = dataSource.getRepository(Team);

  // Fetch user as owner
  const user = await userRepo.findOne({
    where: { role: In([Role.ADMIN, Role.PROJECT_MANAGER]) },
  });
  if (!user) throw new Error('User not found. Seed users first.');

  // Optionally fetch a team to assign
  const team = await teamRepo.findOne({ where: { name: 'Team Research' } });

  const projects = [
    { p_name: 'IT Project Management', user: user, team },
    { p_name: 'Server Management', user: user, team },
  ];

  for (const p of projects) {
    const existing = await projectRepo.findOne({ where: { p_name: p.p_name } });
    if (existing) continue;

    const project = projectRepo.create({ ...p, team: team ?? undefined });
    await projectRepo.save(project);
    console.log(`Project ${p.p_name} created`);
  }
};
