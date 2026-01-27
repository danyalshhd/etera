import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { randomUUID } from 'crypto';
import { validateRequest } from '@dstransaction/common';
import { createBookingWithRetry, getBookingById } from '../services/bookingService';

const router = express.Router();

router.post(
  '/api/bookings',
  [
    body('userId').trim().notEmpty().withMessage('You must supply a user id'),
    body('amount').isFloat({ gt: 0 }).withMessage('You must supply a positive amount'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const amount = Number(req.body.amount);
    const idempotencyKey = req.header('Idempotency-Key') || req.body.idempotencyKey || randomUUID();

    const { booking, error, isNew } = await createBookingWithRetry({ userId, amount, idempotencyKey });

    if (error) {
      const { idempotency_key, ...bookingWithoutKey } = booking;
      res.status(502).send({ ...bookingWithoutKey, message: error });
      return;
    }

    const { idempotency_key, ...bookingWithoutKey } = booking;
    const statusCode = isNew ? 201 : 200;
    res.status(statusCode).send(bookingWithoutKey);
  }
);

router.get(
  '/api/bookings/:id',
  [
    param('id').isUUID().withMessage('Booking ID must be a valid UUID'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const booking = await getBookingById(req.params.id);

    if (!booking) {
      res.status(404).send({ message: 'Booking not found' });
      return;
    }

    const { idempotency_key, ...bookingWithoutKey } = booking;
    res.status(200).send(bookingWithoutKey);
  }
);

export { router as bookingsRouter };
