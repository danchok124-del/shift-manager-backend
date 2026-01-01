import { DataSource } from 'typeorm';
import * as entities from './src/entities';

const ds = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'shift_management',

  entities: Object.values(entities).filter(val => typeof val === 'function'),
  synchronize: false
});


ds.initialize().then(async () => {
  const user = await ds.getRepository(entities.User).findOneBy({ email: 'manager@example.com' });
  if (user) {
    console.log('TOKEN:', user.resetPasswordToken);
  } else {
    console.log('User not found');
  }
  process.exit(0);
}).catch(err => {
  console.error('Error during data source initialization', err);
  process.exit(1);
});

