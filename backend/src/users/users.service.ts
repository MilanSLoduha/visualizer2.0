import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

export type User = {
  userId: string;
  username: string;
  password: string;
};

@Injectable()
export class UsersService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async findOne(username: string): Promise<User | undefined> {
    const res = await this.pool.query(
      'SELECT id as "userId", username, password_hash as password FROM users WHERE username = $1',
      [username]
    );
    return res.rows[0];
  }

  async createUser(username: string, password: string, email: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const res = await this.pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id as "userId", username, email, password_hash as password',
      [username, email, hashedPassword],
    );
    return res.rows[0];
  }
}
