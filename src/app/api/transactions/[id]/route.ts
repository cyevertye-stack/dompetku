import { NextRequest, NextResponse } from 'next/server';
import { deleteTransaction, getTransaction, updateTransaction } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tx = await getTransaction(id);
    if (!tx) {
      return NextResponse.json(
        { success: false, message: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: tx });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil detail transaksi' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.title !== undefined && body.title.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Nama/keterangan transaksi tidak boleh kosong!' },
        { status: 400 }
      );
    }

    if (body.amount !== undefined) {
      const amount = Number(body.amount);
      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json(
          { success: false, message: 'Nominal pengeluaran harus lebih besar dari 0!' },
          { status: 400 }
        );
      }
    }

    const updated = await updateTransaction(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui transaksi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID transaksi tidak valid' },
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
