import express from 'express'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import {getRepository, QueryFailedError} from "typeorm";

import { validate } from "class-validator";
import { doAsync } from '../utils/doAsync';

import {User} from "../entities/User";

const router = express.Router();

interface LoginBody {
  email?: string;
  password?: string;
}

interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
}

router.post('/login', doAsync(async function(req, res) {
  const repository = getRepository(User);

  const { email, password } = <LoginBody>req.body;
  if(!email || !password) return res.status(400).json({ error: 'Missing fields.'})

  const account = await repository.findOne({ where: { email }, select: ["password", "id", "email", "name"] })
  if(!account) return res.status(404).json({ error: 'No such user.'})

  const checked = await bcrypt.compare(password, account.password);
  if(!checked) return res.status(403).json({ error: 'Wrong password.' })
  
  const token = jwt.sign({ id: account.id, email: account.email, name: account.name }, req.app.get('jwt-secret'))
  return res.json({ token })
}));

router.post('/register', doAsync(async function(req, res) {
  const repository = getRepository(User);

  const { name, email, password } = <RegisterBody>req.body;
  if(!name || !email || !password) return res.status(400).json({ error: 'Missing fields.'})

  const user = new User()
  user.name = name
  user.email = email
  
  const hashedPassword = await bcrypt.hash(password, 10)
  user.password = hashedPassword

  const valid = await validate(user)
  if(valid.length > 0) return res.status(400).json({ error: 'Malformed fields.', validation: valid })

  try {
    await repository.save(user)
    res.json({ success: true })
  } catch(e) {
    if(e instanceof QueryFailedError) {
      switch((<any>e).code) {
        case 'ER_DUP_ENTRY':
          return res.status(400).json({ error: 'Duplicate entry.' })
        default:
          throw e
      }
    }
    else return res.status(500).send(e)
  }
}))

export default router;
