import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  nickname: string

  @Column()
  login: string

  @Column()
  password: string

  @Column()
  premium: boolean

  @Column()
  token: string

  @Column()
  date: Date

  @Column({unique: true,nullable: true})
  endToken: Date | null

  @Column()
  countMess: number

  constructor(nickname: string, login: string, password: string) {
    super()
    this.nickname = nickname
    this.login = login
    this.password = password
    this.premium = false
    this.token = ''
    this.date = new Date()
    this.endToken = null
    this.countMess = 0
  }
}