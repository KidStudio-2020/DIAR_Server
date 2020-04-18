import express from 'express'
export const doAsync = (fn: express.RequestHandler): express.RequestHandler => async (req, res, next) => await fn(req, res, next).catch(next);