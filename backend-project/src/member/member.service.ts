import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { In, Repository } from 'typeorm';
import { Member } from './member.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>) {}
  
  async create(createMemberDto: CreateMemberDto): Promise<Member>  {
    return this.memberRepository.save(createMemberDto);
  }

  async findAll(): Promise<Member[]> {
    return this.memberRepository.find();
  }

  async findOne(id: number): Promise<Member | null> {
    return this.memberRepository.findOne({ where: { id } });
  }

  async update(id: number, updateMemberDto: UpdateMemberDto): Promise<Member | null> {
    await this.memberRepository.update(id, updateMemberDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.memberRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Member with id ${id} not found`);
    }
  }
}