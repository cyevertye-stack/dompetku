import { NextRequest, NextResponse } from 'next/server';
import {
  deleteGoldSavings,
  deleteGoldTransaction,
  deleteSavingsGoal,
  deleteSavingsTransaction,
  getGoldSavings,
  getGoldTransactions,
  getSavingsGoals,
  getSavingsTransactions,
  saveGoldSavings,
  saveGoldTransaction,
  saveSavingsGoal,
  saveSavingsTransaction,
} from '@/lib/storage';
import { getCurrentMonthString } from '@/lib/formatters';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const [goals, transactions, goldSavings, goldTransactions] = await Promise.all([
      getSavingsGoals(userId),
      getSavingsTransactions(userId),
      getGoldSavings(userId),
      getGoldTransactions(userId),
    ]);

    const currentMonth = getCurrentMonthString();

    // Total Saldo Tabungan Uang (Deposit - Withdraw)
    const totalSavings = transactions.reduce((acc, t) => {
      return t.type === 'deposit' ? acc + t.amount : acc - t.amount;
    }, 0);

    // Tabungan Masuk Bulan Ini
    const savingsThisMonth = transactions
      .filter((t) => t.type === 'deposit' && t.date.startsWith(currentMonth))
      .reduce((acc, t) => acc + t.amount, 0);

    // Total Gram Emas
    const totalGoldGrams = goldSavings.reduce((acc, g) => acc + (g.weightGrams || 0), 0);

    // Total Nilai Emas (Estimasi atau Modal Beli)
    const totalGoldEstimatedValue = goldSavings.reduce((acc, g) => {
      const priceGram = g.currentEstimatedPricePerGram || g.pricePerGram || 1500000;
      return acc + (g.weightGrams * priceGram);
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        goals,
        transactions,
        totalSavings: Math.max(0, totalSavings),
        savingsThisMonth,
        goldSavings,
        goldTransactions,
        totalGoldGrams: Math.round(totalGoldGrams * 1000) / 1000,
        totalGoldEstimatedValue,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat data tabungan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, goal, transaction, gold, goldTx, userId } = body;

    // 1. Simpan Target Impian
    if (action === 'goal') {
      if (!goal || !goal.title || typeof goal.targetAmount !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Data target tabungan tidak lengkap' },
          { status: 400 }
        );
      }
      const savedGoal = await saveSavingsGoal({
        ...goal,
        userId: userId || goal.userId,
      });
      return NextResponse.json({ success: true, data: savedGoal });
    }

    // 2. Simpan Transaksi Tabungan Uang
    if (action === 'transaction' || (!action && transaction)) {
      const tx = transaction || body;
      if (!tx || typeof tx.amount !== 'number' || tx.amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Nominal tabungan harus lebih dari Rp 0' },
          { status: 400 }
        );
      }
      const savedTx = await saveSavingsTransaction({
        ...tx,
        userId: userId || tx.userId,
      });
      return NextResponse.json({ success: true, data: savedTx });
    }

    // 3. Simpan Kepemilikan Emas (Gold Savings)
    if (action === 'gold') {
      if (!gold || !gold.type || !gold.karat || typeof gold.weightGrams !== 'number' || gold.weightGrams <= 0) {
        return NextResponse.json(
          { success: false, error: 'Data tabungan emas tidak valid (tipe, karat, dan berat gram harus diisi)' },
          { status: 400 }
        );
      }
      const savedGold = await saveGoldSavings({
        ...gold,
        userId: userId || gold.userId,
      });
      return NextResponse.json({ success: true, data: savedGold });
    }

    // 4. Simpan Transaksi Jual/Beli Emas
    if (action === 'gold_transaction') {
      if (!goldTx || !goldTx.goldType || typeof goldTx.weightGrams !== 'number' || goldTx.weightGrams <= 0) {
        return NextResponse.json(
          { success: false, error: 'Data transaksi emas tidak lengkap' },
          { status: 400 }
        );
      }
      const savedGoldTx = await saveGoldTransaction({
        ...goldTx,
        userId: userId || goldTx.userId,
      });
      return NextResponse.json({ success: true, data: savedGoldTx });
    }

    return NextResponse.json(
      { success: false, error: 'Aksi tidak dikenali' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menyimpan tabungan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || undefined;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID tidak diberikan' },
        { status: 400 }
      );
    }

    if (type === 'goal') {
      await deleteSavingsGoal(id, userId);
      return NextResponse.json({ success: true, message: 'Target berhasil dihapus' });
    }

    if (type === 'gold') {
      await deleteGoldSavings(id, userId);
      return NextResponse.json({ success: true, message: 'Koleksi emas berhasil dihapus' });
    }

    if (type === 'gold_transaction') {
      await deleteGoldTransaction(id, userId);
      return NextResponse.json({ success: true, message: 'Transaksi emas berhasil dihapus' });
    }

    await deleteSavingsTransaction(id, userId);
    return NextResponse.json({ success: true, message: 'Transaksi tabungan berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menghapus' },
      { status: 500 }
    );
  }
}
