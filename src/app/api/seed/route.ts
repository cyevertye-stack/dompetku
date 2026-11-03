import { NextRequest, NextResponse } from 'next/server';
import { resetAllData, seedDemoData } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'reset') {
      const state = await resetAllData();
      return NextResponse.json({
        success: true,
        message: 'Semua data transaksi berhasil direset!',
        data: state,
      });
    }

    const state = await seedDemoData();
    return NextResponse.json({
      success: true,
      message: 'Data contoh pengeluaran berhasil dimuat!',
      data: state,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses data contoh' },
      { status: 500 }
    );
  }
}
