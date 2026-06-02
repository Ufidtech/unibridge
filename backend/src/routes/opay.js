import { Router } from 'express';
import { z } from 'zod';
import { firestore } from '../lib/firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/create', requireAuth, async (req, res, next) => {
  try {
    const body = z.object({
      sessionId: z.string().min(1),
      amount: z.number().positive(),
      currency: z.string().default('NGN'),
      payerId: z.string().optional(),
    }).parse(req.body);

    const payment = {
      provider: 'opay',
      sessionId: body.sessionId,
      amount: body.amount,
      currency: body.currency,
      status: 'pending',
      payerUid: body.payerId || req.user.uid,
      createdAt: new Date().toISOString(),
    };

    const ref = await firestore.collection('payments').add(payment);

    return res.status(201).json({
      paymentId: ref.id,
      paymentToken: `mock-opay-token-${ref.id}`,
      checkoutUrl: `${process.env.APP_BASE_URL || ''}/pay/mock/${ref.id}`,
      payment,
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/webhook', async (req, res, next) => {
  try {
    const body = z.object({
      paymentId: z.string().min(1),
      status: z.enum(['completed', 'failed', 'pending']),
    }).parse(req.body);

    const paymentRef = firestore.collection('payments').doc(body.paymentId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await paymentRef.set({ status: body.status, updatedAt: new Date().toISOString() }, { merge: true });

    if (body.status === 'completed') {
      const payment = paymentDoc.data();
      await firestore.collection('sessionRequests').doc(payment.sessionId).set({
        paid: true,
        paymentId: body.paymentId,
        payerId: payment.payerUid,
      }, { merge: true });
    }

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

export default router;