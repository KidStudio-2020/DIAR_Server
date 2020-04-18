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
  const capsules = await repository.createQueryBuilder('capsule')
    .select()
    .where(`POW(111.321 * (lat - :lat), 2) + POW(111.321 * (:lng - lng) * COS(latitude / 57.3), 2) <= 1`) // within 1 km
    .setParameters({ lat: req.body.lat, lng: req.body.lng })
    .limit(3)
    .printSql()
    .getMany()
  return res.send({ capsules })
}));

type CapsuleRequest = AuthorizedRequest<{
  title: string,
  imagePaths: string[],
  description: string,
  placeName: string
}> & GeographicRequest;

router.post('/', doAsync(async function(req: CapsuleRequest, res, next) {
  const repository = getRepository(Capsule);

  if(!req.body || !req.body.lat || !req.body.lng || !req.body.title || !req.body.imagePaths || !req.body.description || !req.body.placeName)
    return res.status(400).json({ error: 'invalid' });

  const user = await getRepository(User).findOne(req.user!.id, { relations: ['user'] });
  if(!user) throw Error('No user found, but authorized');

  const capsule = new Capsule();
  
  capsule.lat = req.body.lat;
  capsule.lng = req.body.lng;
  capsule.title = req.body.title;
  capsule.placeName = req.body.placeName;
  capsule.description = req.body.description;
  capsule.imagePaths = req.body.imagePaths;
  capsule.user.push(user);

  repository.save(capsule);
}))

export default router;
