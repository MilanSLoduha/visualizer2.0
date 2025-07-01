import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

async signIn(username: string, pass: string): Promise<{ access_token: string }> {
    try {
        const user = await this.usersService.findOne(username);
        if (!user) {
        throw new UnauthorizedException('User not found');
        } 
        const passwordMatch = await bcrypt.compare(pass, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedException('Invalid password');
        }
        const payload = { sub: user.userId, username: user.username };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    } catch (error) {
        console.error('AuthService.signIn error:', error);
        throw error;
    }
}

async signUp(username: string, password: string, email: string): Promise<{ access_token: string }> {
    try {
        const existingUser = await this.usersService.findOne(username);
        if (existingUser) {
            throw new UnauthorizedException('Username already exists');            }
            const user = await this.usersService.createUser(username, password, email);
            const payload = { sub: user.userId, username: user.username };
            return {
                access_token: await this.jwtService.signAsync(payload),
            };
        } catch (error) {
            console.error('AuthService.signUp error:', error);
            throw error;
        }
    }
}