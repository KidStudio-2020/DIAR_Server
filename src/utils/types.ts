import { User } from "../entities/User";
import express from 'express';

export interface AuthorizedRequest extends express.Request {
  user?: {
    id: User['id'],
    email: User['email']
    name: User['name']
  }
}