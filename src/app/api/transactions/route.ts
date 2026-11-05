import { NextRequest, NextResponse } from 'next/server';
import { createTransaction, deleteTransaction, getTransactions } from '@/lib/storage';
import { TransactionFilter } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter: TransactionFilter = {
      userId: searchParams.get('userId') || undefined,
      search: searchParams.get('search') || undefined,
      type: (searchParams.get('type') as TransactionFilter['type']) || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      paymentMethod: searchParams.get('paymentMethod') || undefined,
      month: searchParams.get('month') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      sortBy: (searchParams.get('sortBy') as TransactionFilter['sortBy']) || undefined,
    };

    const transactions = await getTransactions(filter);
    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data transaksi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.title || body.title.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Nama/keterangan pengeluaran tidak boleh kosong!' },
        { status: 400 }
      );
    }

    const amount = Number(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Nominal pengeluaran harus lebih besar dari 0!' },
        { status: 400 }
      );
    }

    if (!body.categoryId) {
      return NextResponse.json(
        { success: false, message: 'Kategori pengeluaran harus dipilih!' },
        { status: 400 }
      );
    }

    if (!body.date) {
      return NextResponse.json(
        { success: false, message: 'Tanggal transaksi harus diisi!' },
        { status: 400 }
      );
    }

    const newTx = await createTransaction({
      userId: body.userId || undefined,
      title: body.title.trim(),
      amount,
      type: body.type === 'income' ? 'income' : 'expense',
      categoryId: body.categoryId,
      date: body.date,
      paymentMethod: body.paymentMethod || 'Tunai',
      notes: body.notes ? body.notes.trim() : '',
    });

    return NextResponse.json({ success: true, data: newTx }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server saat menyimpan transaksi' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID transaksi wajib disertakan' },
        { status: 400 }
      );
    }

    await deleteTransaction(id);
    return NextResponse.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal menghapus transaksi' },
      { status: 500 }
    );
  }
}
