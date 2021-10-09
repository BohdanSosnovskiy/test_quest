import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('messages')
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column()
  text: string

  @Column()
  user_id: number

  @Column()
  date: Date


  constructor(title: string, text: string, user_id: number) {
    super()
    this.title = title
    this.text = text
    this.user_id = user_id
    this.date = new Date()
  }
}