import express from "express";
import { getRepository } from "typeorm";
import { doAsync } from '../utils/doAsync';

import { User } from "../entities/User";
import { AuthorizedRequest } from "../utils/types";

const router = express.Router();

type FriendRequest = AuthorizedRequest<{
  id?: User['id'] | undefined
}>

router.get("/", doAsync(async function(req: AuthorizedRequest, res, next) {
  const repository = getRepository(User);
  const user = await repository.findOne(req.user!.id);
  if(!user) throw Error('No user found, but authorized');
  return res.send({ friends: user.friends })
}));

router.post("/", doAsync(async function(req: FriendRequest, res, next) {
  const repository = getRepository(User);
  
  if(!req.body.id) return res.status(400).send({ error: 'missing id' });

  const user = await repository.findOne(req.user!.id, { relations: ['friends'] });
  const friend = await repository.findOne(req.body.id);
  
  if(!user || !friend) return res.status(404).send({ error: 'No user found.' })
  
  user.friends.push(friend);
  repository.save(user);
  
  return res.send({ done: true });
}));

router.delete("/", doAsync(async function(req: FriendRequest, res, next) {
  const repository = getRepository(User);
  if(!req.body.id) return res.status(400).send({ error: 'missing id' });
  
  const user = await repository.findOne(req.user!.id, { relations: ['friends'] });
  if(!user) return res.status(404).send({ error: 'No user found.' })
  
  user.friends = user.friends.filter(usr => usr.id !== req.body.id)
  repository.save(user);
  
  return res.send({ done: true });
}));

export default router;
