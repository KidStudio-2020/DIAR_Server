import express from "express";
import { getRepository } from "typeorm";
import { doAsync } from '../utils/doAsync';

import { Capsule } from "../entities/Capsule";
import { AuthorizedRequest } from "../utils/types";

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



export default router;
