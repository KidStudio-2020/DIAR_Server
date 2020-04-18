import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { User } from "./User";

@Entity()
export class Capsule {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToMany(type => User, user => user.capsules, {cascade:true})
  @JoinTable()
  user!: User[];

  @Column()
  title!: string;

  @Column("simple-array")
  imagePaths!: string[];

  @Column()
  description!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7
  })
  lat!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7
  })
  lng!: string;

  @Column()
  placeName!: string;
}