import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable } from "typeorm";
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

  @Column()
  imagePath!: string;

  @ManyToMany(type => Mission, mission => mission.completedBy, { cascade: true })
  @JoinTable()
  missions!: Mission[];

  @ManyToMany(type => User, user => user.friends)
  @JoinTable()
  friends!: User[];

  @Column({
    default: 0
  })
  coin!: number;
}