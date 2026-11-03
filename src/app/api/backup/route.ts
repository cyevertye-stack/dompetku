import { NextRequest, NextResponse } from 'next/server';
import { getAppState, restoreAppState } from '@/lib/storage';

// Export complete backup as JSON
export async function GET() {
  try {
    const state = await getAppState();
    const filename = `dompetku-backup-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(JSON.stringify(state, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal membuat file backup' },
      { status: 500 }
    );
  }
}

// Restore from JSON backup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await restoreAppState(body);

    return NextResponse.json({
      success: true,
      message: 'Data DompetKu berhasil dipulihkan dari file backup!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memulihkan data backup' },
      { status: 400 }
    );
  }
}
