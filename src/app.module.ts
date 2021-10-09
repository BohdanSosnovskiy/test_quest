import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { Message } from './message.model';
import { User } from './user.model';
import { Comment } from './comment.model';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'AHPkzfs5T2',
      database: 'QQ',
      logging: true,
      synchronize: true,
      entities: [User,Message,Comment]
    })
  ],
  controllers: [AppController],
})
export class AppModule {}
