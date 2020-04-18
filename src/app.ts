import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import helmet from 'helmet'
import jwt from 'express-jwt'
import * as Sentry from '@sentry/node'

import indexRouter from './routes'
import usersRouter from './routes/users'
import capsulesRouter from './routes/capsules'
import friendsRouter from './routes/friends'

import "reflect-metadata"
import { createConnection } from 'typeorm'

const app = express();

if (process.env.SENTRY_DSN) Sentry.init({ dsn: process.env.SENTRY_DSN });
else throw Error('No Sentry DSN found.')

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());

if (process.env.JWT_SECRET) app.set('jwt-secret', process.env.JWT_SECRET)
else throw Error('No JWT secret found.')

createConnection().then(() => {
  app.use('/users/friends', jwt({ secret: app.get('jwt-secret') }), friendsRouter);
  app.use('/users', usersRouter);
  app.use('/capsules', jwt({ secret: app.get('jwt-secret') }), capsulesRouter);
  app.use('/', jwt({ secret: app.get('jwt-secret') }), indexRouter);
  app.use(Sentry.Handlers.errorHandler());
}).catch(e => { throw e })

export default app;
