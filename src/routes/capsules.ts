import express from "express";
import { getRepository } from "typeorm";
import { doAsync } from '../utils/doAsync';

import { Capsule } from "../entities/Capsule";

const router = express.Router();

const repository = getRepository(Capsule);

router.get("/", function(req, res, next) {

});

export default router;
