import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, OneToMany } from "typeorm";
import { IsEmail, IsNotEmpty } from "class-validator";
import { Capsule } from "./Capsule";
import { Mission } from "./Mission";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdDate!: Date;

  @Column()
  @IsNotEmpty()
  name!: string;

  @Column({
    unique: true
  })
  @IsEmail()
  email!: string;

  @Column()
  password!: string;

  @ManyToMany(type => Capsule, capsule => capsule.user, { cascade: true })
  capsules!: Capsule[];

  @ManyToMany(type => Mission, mission => mission.completedBy, { cascade: true })
  missions!: Mission[];

  @ManyToMany(type => User, user => user.friends, { cascade: true })
  friends!: User[];

  @Column({
    default: 0
  })
  coin!: number;
}