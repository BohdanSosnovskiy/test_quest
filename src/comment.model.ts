import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('comments')
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  mess_id: number

  @Column()
  user_id: number

  @Column({unique: true,nullable: true})
  main_column_id: number | null

  @Column()
  text: string

  @Column()
  date: Date


  constructor(mess_id: number, user_id: number, text: string , main_column_id?: number) {
    super()
    this.mess_id = mess_id
    this.text = text
    this.user_id = user_id
    this.date = new Date()
    this.main_column_id = main_column_id||null
  }
}