import { Router } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { firestore } from '../lib/firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function nowIso() {
  return new Date().toISOString();
}

function getPlatformFees(amount) {
  const baseAmount = Number(amount || 0);
  const menteeFee = Number((baseAmount * 0.1).toFixed(2));
  const mentorFee = Number((baseAmount * 0.05).toFixed(2));
  const mentorPayout = Number((baseAmount - mentorFee).toFixed(2));

  return {
    baseAmount,
    menteeFee,
    mentorFee,
    mentorPayout,
    platformRevenue: Number((menteeFee + mentorFee).toFixed(2)),
    menteeChargeTotal: Number((baseAmount + menteeFee).toFixed(2)),
  };
}

async function maybeCreateRealOpayPayout(payload) {
  if (!process.env.OPAY_PAYOUT_URL || !process.env.OPAY_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(process.env.OPAY_PAYOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPAY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn('[opay] real payout failed, falling back to mock:', error?.message);
    return null;
  }
}

function verifyOpaySignature(req) {
  const secret = process.env.OPAY_WEBHOOK_SECRET;
  if (!secret) {
    return true;
  }

  const signature = req.headers['x-opay-signature'] || req.headers['x-opay-sign'] || req.headers['authorization'];
  if (!signature) {
    return false;
  }

  const payload = JSON.stringify(req.body || {});
  const digest = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return String(signature).replace(/^Bearer\s+/i, '') === digest;
}

router.post('/create', requireAuth, async (req, res, next) => {
  try {
    const body = z.object({
      sessionId: z.string().min(1),
      amount: z.number().positive(),
      currency: z.string().default('NGN'),
      payerId: z.string().optional(),
      bookingType: z.enum(['PRIVATE_BOOKING']).optional(),
    }).parse(req.body);

    const fees = getPlatformFees(body.amount);

    const payment = {
      provider: 'opay',
      sessionId: body.sessionId,
      bookingType: body.bookingType || 'PRIVATE_BOOKING',
      amount: body.amount,
      currency: body.currency,
      status: 'pending',
      payerUid: body.payerId || req.user.uid,
      feeBreakdown: fees,
      createdAt: nowIso(),
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

router.post('/payout', requireAuth, async (req, res, next) => {
  try {
    const body = z.object({
      sessionId: z.string().min(1),
      mentorId: z.string().min(1),
      amount: z.number().positive(),
      currency: z.string().default('NGN'),
      reason: z.string().default('Private booking payout'),
    }).parse(req.body);

    const fees = getPlatformFees(body.amount);
    const payoutRef = firestore.collection('payouts').doc();
    const payout = {
      provider: 'opay',
      payoutType: 'PRIVATE_BOOKING',
      sessionId: body.sessionId,
      mentorId: body.mentorId,
      currency: body.currency,
      amount: fees.mentorPayout,
      feeBreakdown: fees,
      status: 'pending',
      reason: body.reason,
      requestedBy: req.user.uid,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    const realResponse = await maybeCreateRealOpayPayout(payout);

    if (realResponse) {
      payout.status = realResponse.status || 'processing';
      payout.providerRef = realResponse.id || realResponse.reference || null;
      payout.rawResponse = realResponse;
    } else {
      payout.status = 'completed';
      payout.providerRef = `mock-opay-payout-${payoutRef.id}`;
      payout.rawResponse = {
        mock: true,
        createdAt: payout.createdAt,
      };
    }

    await payoutRef.set(payout);

    await firestore.collection('sessionRequests').doc(body.sessionId).set(
      {
        privateBooking: true,
        payoutId: payoutRef.id,
        payoutStatus: payout.status,
        updatedAt: nowIso(),
      },
      { merge: true },
    );

    return res.status(201).json({
      payoutId: payoutRef.id,
      payout,
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/webhook', async (req, res, next) => {
  try {
    if (!verifyOpaySignature(req)) {
      return res.status(401).json({ error: 'Invalid OPay signature' });
    }

    const body = z.object({
      eventType: z.enum(['payment', 'payout']).optional(),
      paymentId: z.string().min(1).optional(),
      payoutId: z.string().min(1).optional(),
      providerRef: z.string().optional(),
      status: z.string().min(1),
    }).parse(req.body);

    if (body.eventType === 'payout' || body.payoutId) {
      const payoutRef = firestore.collection('payouts').doc(body.payoutId || body.providerRef);
      const payoutDoc = await payoutRef.get();

      if (!payoutDoc.exists) {
        return res.status(404).json({ error: 'Payout not found' });
      }

      const payoutStatus = body.status.toLowerCase();
      const payout = payoutDoc.data();

      await payoutRef.set({
        status: payoutStatus,
        providerRef: body.providerRef || payout.providerRef || null,
        updatedAt: nowIso(),
      }, { merge: true });

      await firestore.collection('sessionRequests').doc(payout.sessionId).set({
        payoutStatus,
        updatedAt: nowIso(),
      }, { merge: true });

      await firestore.collection('privateBookingRequests').doc(payout.sessionId).set({
        payoutStatus,
        updatedAt: nowIso(),
      }, { merge: true });

      return res.json({ ok: true, type: 'payout' });
    }

    const paymentRef = firestore.collection('payments').doc(body.paymentId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const paymentStatus = body.status.toLowerCase();
    await paymentRef.set({ status: paymentStatus, updatedAt: new Date().toISOString() }, { merge: true });

    if (paymentStatus === 'completed') {
      const payment = paymentDoc.data();
      const fees = getPlatformFees(payment.amount);
      await firestore.collection('sessionRequests').doc(payment.sessionId).set({
        paid: true,
        paymentId: body.paymentId,
        payerId: payment.payerUid,
        bookingType: payment.bookingType || 'PRIVATE_BOOKING',
        privateBooking: true,
        feeBreakdown: fees,
        paymentStatus,
        updatedAt: nowIso(),
      }, { merge: true });

      await firestore.collection('privateBookingRequests').doc(payment.sessionId).set({
        status: 'paid',
        paymentStatus,
        updatedAt: nowIso(),
      }, { merge: true });
    }

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

export default router;