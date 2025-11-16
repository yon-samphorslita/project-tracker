import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import { Role } from '../enums/role.enum';

export const seedUsers = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);

  const users = [
    {
      first_name: 'System',
      last_name: 'Admin',
      email: 'admin@email.com',
      role: Role.ADMIN,
    },
    {
      first_name: 'Nancy',
      last_name: 'Drew',
      email: 'manager1@gmail.com',
      role: Role.PROJECT_MANAGER,
    },
    {
      first_name: 'Jenny',
      last_name: 'Smith',
      email: 'manager2@gmail.com',
      role: Role.PROJECT_MANAGER,
    },
    {
      first_name: 'Mary',
      last_name: 'Sue',
      email: 'member1@gmail.com',
      role: Role.MEMBER,
    },
    {
      first_name: 'Blonde',
      last_name: 'Karen',
      email: 'member2@gmail.com',
      role: Role.MEMBER,
    },
    {
      first_name: 'William',
      last_name: 'Chen',
      email: 'member3@gmail.com',
      role: Role.MEMBER,
    },

  ];

  for (const u of users) {
    const existing = await userRepository.findOne({ where: { email: u.email } });
    if (existing) continue;

    const user = userRepository.create({ ...u });
    await userRepository.save(user);
    console.log(`User ${u.email} created`);
  }
};
