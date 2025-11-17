import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { seedUsers } from './user.seed';
import { seedProjects } from './project.seed';
import { seedTeams } from './team.seed';

async function runSeeder() {
  const dataSource = AppDataSource;

  try {
    await dataSource.initialize();
    console.log('Database connected');

    // Seed in order of dependencies
    await seedUsers(dataSource);
    await seedProjects(dataSource);
    await seedTeams(dataSource)

    console.log('Seeding complete!');
    await dataSource.destroy();
  } catch (err) {
    console.error('Seeding failed', err);
    await dataSource.destroy();
    process.exit(1);
  }
}

runSeeder();
