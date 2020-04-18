import express from "express";
import { getRepository } from "typeorm";
import { doAsync } from '../utils/doAsync';

import { User } from "../entities/User";
import { AuthorizedRequest } from "../utils/types";

const router = express.Router();

const repository = getRepository(User);

interface FreindRequest extends express.Request {
  body: {
    id?: User['id'] | undefined
  },
  user?: AuthorizedRequest['user']
}

router.get("/", doAsync(async function(req: AuthorizedRequest, res, next) {
  const user = await repository.findOne(req.user!.id);
  if(!user) throw Error('No user found, but authorized');
  return res.send({ friends: user.friends })
}));

router.post("/", doAsync(async function(req: FreindRequest, res, next) {
  if(!req.body.id) return res.status(400).send({ error: 'missing id' });
  const user = await repository.findOne(req.user!.id);
  const friend = await repository.findOne(req.body.id);
  if(!user || !friend) return res.status(404).send({ error: 'No user found.' })
  user.friends.push(friend);
  repository.save(user);
  return res.send({ done: true });
}));

router.delete("/", doAsync(async function(req: FreindRequest, res, next) {
  if(!req.body.id) return res.status(400).send({ error: 'missing id' });
  const user = await repository.findOne(req.user!.id);
  if(!user) return res.status(404).send({ error: 'No user found.' })
  user.friends = user.friends.filter(usr => usr.id !== req.body.id)
  repository.save(user);
  return res.send({ done: true });
}));

export default router;
