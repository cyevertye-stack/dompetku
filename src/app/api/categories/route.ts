import { NextRequest, NextResponse } from 'next/server';
import { createCategory, deleteCategory, getCategories, updateCategory } from '@/lib/storage';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memuat kategori' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Nama kategori wajib diisi!' },
        { status: 400 }
      );
    }

    const newCat = await createCategory({
      name: body.name.trim(),
      icon: body.icon || 'Tag',
      color: body.color || '#3B82F6',
      budgetLimit: Number(body.budgetLimit) || 0,
      isDefault: false,
    });

    return NextResponse.json({ success: true, data: newCat }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal membuat kategori baru' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID kategori wajib disertakan' },
        { status: 400 }
      );
    }

    const updated = await updateCategory(id, data);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui kategori' },
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
        { success: false, message: 'ID kategori wajib disertakan' },
        { status: 400 }
      );
    }

    const result = await deleteCategory(id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Kategori tidak dapat dihapus' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus kategori' },
      { status: 500 }
    );
  }
}
