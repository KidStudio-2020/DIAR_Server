import { User } from "../entities/User";
import express from 'express';

export interface AuthorizedRequest<T = {}> extends express.Request {
  body: Partial<T>
  user?: {
    id: User['id'],
    email: User['email']
    name: User['name']
  }
}