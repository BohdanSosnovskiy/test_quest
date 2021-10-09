import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Message } from './message.model';
import { User } from './user.model';
import { Comment } from './comment.model';

const sha1 = require('node-sha1')

function getRandom(min, max) {
  return parseInt(Math.random() * (max - min) + min);
}

const stripe = require('stripe')('insert secret key')

function genCode()
{
  const alf = '0q1Q2a3A4z4Z5w6W7s8S9xXeEdDcCrRfFvVtTgGbByYhHnNuUjJmMiIkKoOlLpP'
  let result = ""
  for(let i = 0; i < 48; i++)
  {
      result += alf[getRandom(0,alf.length-1)]
  }
  return result
}

function toHashPassword(password:string) :string
{
  return sha1(password)
}

@Controller()
export class AppController {

  @Get()
  async index()
  {
    return 'Hi'
  }
  @Post('auth')
  async auth(@Body() body: { login: string, password: string }): Promise<object> 
  {
    
    let user = await User.findOne({login:body.login,password:toHashPassword(body.password)})
    if(user)
    {
      user.token = genCode()
      let d = new Date()
      user.endToken = new Date(d.setDate(d.getDate() + 1))
      user.save()
      return {token:user.token}
    }
    else
    {
      return null
    }
  }
  
  @Post('regestration')
  async regestration(@Body() body: { nickname:string, login: string; password: string }): Promise<void> 
  {
    const user = await new User(body.nickname,body.login,toHashPassword(body.password))
    user.save()
  }

  @Post('new_post')
  async new_post(@Body() body: { token: string, title: string, text: string }): Promise<object>
  {
    let user = await User.findOne({token:body.token})
    if(user)
    {
      if(user.premium)
      {
        const post = await new Message(body.title,body.text,user.id)
        post.save()
        return {post_id: post.id}
      }
      else if(user.countMess < 2)
      {
        const post = await new Message(body.title,body.text,user.id)
        post.save()
        user.countMess++
        user.save()
        return {post_id: post.id}
      }
      else
      {
        return {error: 'Buy premium, redirect to /pay'}
      }
    }
    else
    {
      return {error: 'you are not authorized'}
    }
  }

  @Post('edit_post')
  async edit_post(@Body() body: { token: string, post_id: number, new_title?: string, new_text?: string}): Promise<object>
  {
    let user = await User.findOne({token:body.token})
    if(user)
    {
      let post = await Message.findOne({id:body.post_id, user_id:user.id})
      if(post)
      {
        if(body.new_title)
        {
          post.title = body.new_title
        }
        if(body.new_text)
        {
          post.text = body.new_text
        }
        post.save()
        return {message: 'Post edited'}
      }
      else
      {
        return {error:'Access denied'}
      }
    }
    else
    {
      return {error: 'you are not authorized'}
    }
  }

  @Post('remove_post')
  async remove_post(@Body() body: { token: string, post_id: number }): Promise<object>
  {
    let user = await User.findOne({token:body.token})
    if(user)
    {
      await Message.delete({id:body.post_id,user_id: user.id})
    }
    else
    {
      return {error: 'you are not authorized'}
    }
  }

  @Post('new_comment')
  async new_comment(@Body() body: { token: string; post_id: number, text: string, main_column_id?: number }): Promise<object>
  {
    let user = await User.findOne({token:body.token})
    if(user)
    {
      const comment = await new Comment(body.post_id,user.id,body.text,body.main_column_id)
      comment.save()
      return {comment_id: comment.id}
    }
    else
    {
      return {error: 'you are not authorized'}
    }
  }

  @Post('edit_comment')
  async edit_comment(@Body() body: { token: string, comment_id: number, new_text: string}): Promise<object>
  {
    let user = await User.findOne({token:body.token})
    if(user)
    {
      let comment = await Comment.findOne({id:body.comment_id, user_id:user.id})
      if(comment)
      {
        comment.text = body.new_text
        comment.save()
        return {message: 'Comment edited'}
      }
      else
      {
        return {error:'Access denied'}
      }
    }
    else
    {
      return {error: 'you are not authorized'}
    }
  }

  @Post('remove_comment')
  async remove_comment(@Body() body: { token: string; comment_id: number }): Promise<object>
  {
    let user = await User.findOne({token:body.token})
    if(user)
    {
      await Comment.delete({id:body.comment_id,user_id: user.id})
    }
    else
    {
      return {error: 'you are not authorized'}
    }
  }

  @Post('pay')
  async pay_premium(@Body() body: { token: string })
  {
    try
    {
      let user = await User.findOne({token:body.token})
      if(user)
      {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: 100,
          currency: 'usd',
          payment_method_types: ['card'],
        });
        user.premium = true
        user.save()
      }
      else
      {
        return {error: 'you are not authorized'}
      }
    }
    catch(err)
    {
      return {err:err.message}
    }
    
  }

  @Get('posts')
  async posts()
  {
    const posts = await Message.find({select: ["id","title"]})
    return {posts}
  }

  @Get('post/:id')
  async info_post(@Param('id', ParseIntPipe) id: number)
  {
    let post = await Message.findOne({id})
    if(post)
    {
      let comments = await Comment.find({where: {mess_id:post.id, main_column_id:null}})
      return {post,comments}
    }
    else
    {
      return 'Post not found'
    }
  }
}
