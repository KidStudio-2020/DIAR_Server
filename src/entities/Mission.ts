import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { User } from "./User";

export enum MissionType {
  NATIONWIDE,
  LOCAL
}

@Entity()
export class Mission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({
    type: "enum",
    enum: MissionType
  })
  type!: MissionType;

  @Column({
    default: false
  })
  isSponsored!: boolean;

  @Column()
  prize!: number;

  @ManyToMany(type => User, user => user.missions)
  completedBy!: User[];
}