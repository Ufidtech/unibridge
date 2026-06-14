import { Router } from 'express';
import { z } from 'zod';
import { firestore } from '../lib/firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function nowIso() {
  return new Date().toISOString();
}

async function getOrCreateWallet(userId) {
  const walletRef = firestore.collection('wallets').doc(userId);
  const walletDoc = await walletRef.get();
  if (walletDoc.exists) {
    const wallet = walletDoc.data() || {};
    return {
      walletRef,
      wallet: {
        userId,
        currentBalance: Number(wallet.currentBalance || 0),
        escrowBalance: Number(wallet.escrowBalance || 0),
        transactionHistory: Array.isArray(wallet.transactionHistory) ? wallet.transactionHistory : [],
        requestLinks: Array.isArray(wallet.requestLinks) ? wallet.requestLinks : [],
        updatedAt: wallet.updatedAt || null,
      },
    };
  }

  const wallet = {
    userId,
    currentBalance: 0,
    escrowBalance: 0,
    transactionHistory: [],
    requestLinks: [],
    updatedAt: nowIso(),
  };
  await walletRef.set(wallet);
  return { walletRef, wallet };
}

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { wallet } = await getOrCreateWallet(req.user.uid);
    return res.json({ wallet });
  } catch (err) {
    return next(err);
  }
});

router.get('/me/transactions', requireAuth, async (req, res, next) => {
  try {
    const { wallet } = await getOrCreateWallet(req.user.uid);
    const transactions = Array.isArray(wallet.transactionHistory) ? wallet.transactionHistory : [];
    return res.json({
      balance: Number(wallet.currentBalance || 0),
      escrowBalance: Number(wallet.escrowBalance || 0),
      transactions,
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/request-links', requireAuth, async (req, res, next) => {
  try {
    const body = z.object({
      amount: z.coerce.number().positive(),
      note: z.string().optional(),
      baseUrl: z.string().url().optional(),
    }).parse(req.body || {});

    const { walletRef, wallet } = await getOrCreateWallet(req.user.uid);
    const linkId = `req-${Date.now()}`;
    const baseUrl = body.baseUrl || process.env.APP_BASE_URL || '';
    const shareUrl = `${baseUrl}/request-funds?menteeId=${req.user.uid}&amount=${body.amount}&note=${encodeURIComponent(body.note || '')}&share=${linkId}`;
    const requestLink = {
      id: linkId,
      amount: body.amount,
      note: body.note || '',
      url: shareUrl,
      createdAt: nowIso(),
    };

    const requestLinks = [requestLink, ...(wallet.requestLinks || [])];
    await walletRef.set({
      requestLinks,
      updatedAt: nowIso(),
    }, { merge: true });

    await firestore.collection('walletRequestLinks').doc(linkId).set({
      userId: req.user.uid,
      ...requestLink,
      updatedAt: nowIso(),
    });

    return res.status(201).json({ requestLink, wallet: { ...wallet, requestLinks } });
  } catch (err) {
    return next(err);
  }
});

router.post('/fund', requireAuth, async (req, res, next) => {
  try {
    const body = z.object({
      amount: z.coerce.number().positive(),
      note: z.string().optional(),
      sponsorName: z.string().optional(),
      source: z.string().default('sponsor_checkout'),
    }).parse(req.body || {});

    const { walletRef, wallet } = await getOrCreateWallet(req.user.uid);
    const transaction = {
      id: `fund-${Date.now()}`,
      userId: req.user.uid,
      type: 'WALLET_FUND',
      amount: Number(body.amount),
      currency: 'NGN',
      description: body.note || 'Sponsored wallet funding',
      source: body.source,
      sponsorName: body.sponsorName || null,
      status: 'completed',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    const nextBalance = Number((Number(wallet.currentBalance || 0) + Number(body.amount)).toFixed(2));
    const transactionHistory = [transaction, ...(wallet.transactionHistory || [])];
    const updatedWallet = {
      ...wallet,
      currentBalance: nextBalance,
      transactionHistory,
      updatedAt: nowIso(),
    };

    await walletRef.set(updatedWallet, { merge: true });

    await firestore.collection('walletTransactions').doc(transaction.id).set(transaction);
    return res.status(201).json({ wallet: updatedWallet, transaction });
  } catch (err) {
    return next(err);
  }
});

export default router;
