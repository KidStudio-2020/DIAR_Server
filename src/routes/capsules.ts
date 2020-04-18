import express from "express";
import { getRepository } from "typeorm";
import { doAsync } from '../utils/doAsync';

import { Capsule } from "../entities/Capsule";
import { AuthorizedRequest } from "../utils/types";
import { User } from "../entities/User";

const router = express.Router();

type GeographicRequest = AuthorizedRequest<{
  lat: string, 
  lng: string 
}>;

router.get("/", doAsync(async function(req: GeographicRequest, res, next) {
  const repository = getRepository(Capsule);
  if(!req.body.lat || !req.body.lng) return res.send({ error: 'Missing fields.' })
  const capsules = await repository.createQueryBuilder('capsule')
    .select()
    .where(`POW(111.321 * (lat - :lat), 2) + POW(111.321 * (:lng - lng) * COS(lat / 57.3), 2) <= 1`) // within 1 km
    .setParameters({ lat: req.body.lat, lng: req.body.lng })
    .innerJoinAndSelect('capsule.user', 'user', 'user.id = :id', {id: req.user!.id})
    .limit(3)
    .getMany()
  return res.send({ 
    capsules: capsules.map(c => ({ lat: c.lat, lng: c.lng, id: c.id, title: c.title, description: c.description, imagePaths: c.imagePaths })) 
  })
}));

type CapsuleCreationRequest = AuthorizedRequest<{
  title: string,
  imagePaths?: string[],
  description: string,
  placeName: string
}> & GeographicRequest;

router.post('/', doAsync(async function(req: CapsuleCreationRequest, res, next) {
  const repository = getRepository(Capsule);

  if(!req.body || !req.body.lat || !req.body.lng || !req.body.title || !req.body.description || !req.body.placeName)
    return res.status(400).json({ error: 'Missing fields.' });

  const user = await getRepository(User).findOne(req.user!.id);
  if(!user) throw Error('No user found, but authorized');

  const capsule = new Capsule();
  
  capsule.lat = req.body.lat;
  capsule.lng = req.body.lng;
  capsule.title = req.body.title;
  capsule.placeName = req.body.placeName;
  capsule.description = req.body.description;
  if(req.body.imagePaths) capsule.imagePaths = req.body.imagePaths;
  else capsule.imagePaths = [];
  if(capsule.user) capsule.user.push(user);
  else capsule.user = [user];

  repository.save(capsule);
  return res.json({ done: true })
}))

type CapsuleRemovalRequest = AuthorizedRequest<{
  id?: number;
}>;

router.delete('/', doAsync(async function(req: CapsuleRemovalRequest, res, next) {
  if(!req.body || !req.body.id) return res.status(400).json({ error: 'Missing fields.' });
  
  const repository = getRepository(Capsule);
  const capsule = await repository.findOne(req.body.id, { relations: ['user'] });

  if(!capsule) return res.status(404).json({ error: 'No entry found. '})
  if(capsule.user.every(u => u.id !== req.user!.id)) res.status(403).json({ error: 'Attempted to remove other\'s capsule.'})

  repository.remove(capsule);
  return res.json({ done: true })
}))

type CapsuleModificationRequest = CapsuleRemovalRequest & CapsuleCreationRequest;

router.put('/', doAsync(async function(req: CapsuleModificationRequest, res, next) {
  const repository = getRepository(Capsule);

  if(!req.body.id)
    return res.status(400).json({ error: 'Missing fields.' });

  const user = await getRepository(User).findOne(req.user!.id, { relations: ['user'] });
  if(!user) throw Error('No user found, but authorized');
  
  const capsule = await repository.findOne(req.body.id);
  if(!capsule) return res.status(404).json({ error: 'No entry found. '})
  
  if(req.body.lat) capsule.lat = req.body.lat;
  if(req.body.lng) capsule.lng = req.body.lng;
  if(req.body.title) capsule.title = req.body.title;
  if(req.body.placeName) capsule.placeName = req.body.placeName;
  if(req.body.description) capsule.description = req.body.description;
  if(req.body.imagePaths) capsule.imagePaths = req.body.imagePaths;
  if(req.user) capsule.user.push(user);

  repository.save(capsule);
  return res.json({ done: true })
}))

export default router;
