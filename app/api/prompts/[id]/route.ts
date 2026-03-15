import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.get('admin_session')?.value === 'authenticated';
}

// DELETE /api/prompts/[id]
export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await prisma.prompt.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE /api/prompts/[id]]', error);
        return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
    }
}
