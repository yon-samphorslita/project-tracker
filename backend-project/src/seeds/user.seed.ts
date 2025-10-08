import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import { Role } from '../enums/role.enum';
import * as bcrypt from 'bcrypt';

export const createInitialAdmin = async (dataSource: DataSource) => {
  if (!dataSource) {
    console.error('DataSource is undefined! Check your app.get(DataSource)');
    return;
  }

  try {
    const userRepository = dataSource.getRepository(User);
    console.log('User repository obtained');

    // Find existing admin
    let admin = await userRepository.findOne({ where: { role: Role.ADMIN } });

    if (admin) {
      // Update existing admin
      admin = {
        ...admin,
        first_name: 'System',
        last_name: 'Admin',
        email: 'admin@email.com',
        password: await bcrypt.hash('admin123', 10),
      };
      await userRepository.save(admin);
      console.log(`Admin updated: ${admin.email}`);
      return;
    }

    // Create new admin
    admin = userRepository.create({
      first_name: 'System',
      last_name: 'Admin',
      email: 'admin@email.com',
      password: await bcrypt.hash('admin123', 10),
      role: Role.ADMIN,
      active: true,
    });

    await userRepository.save(admin);
    console.log(`Initial admin created: ${admin.email} / admin123`);
  } catch (err) {
    console.error('Failed to create admin:', err);
  }
};
