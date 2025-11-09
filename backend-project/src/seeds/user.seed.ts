import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import { Role } from '../enums/role.enum';
import * as bcrypt from 'bcrypt';

export const createInitialAdmin = async (dataSource: DataSource) => {
  if (!dataSource) return;

  try {
    const userRepository = dataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { role: Role.ADMIN },
    });

    if (existingAdmin) return;

    // Create new admin if none exists
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const newAdmin = userRepository.create({
      first_name: 'System',
      last_name: 'Admin',
      email: 'admin@email.com',
      password: hashedPassword,
      role: Role.ADMIN,
      active: true,
    });

    await userRepository.save(newAdmin);
  } catch (err) {
    console.error('Failed to create admin:', err);
  }
};
