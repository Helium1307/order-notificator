import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  async register(email: string, nome: string, senha: string): Promise<Usuario> {
    const existing = await this.repo.findOneBy({ email });
    if (existing) throw new ConflictException('Email já cadastrado');
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = this.repo.create({ email, nome, senhaHash });
    return this.repo.save(usuario);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.repo.findOneBy({ email });
  }

  async findById(id: string): Promise<Usuario | null> {
    return this.repo.findOneBy({ id });
  }
}
