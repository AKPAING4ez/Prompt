import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.get('admin_session')?.value === 'authenticated';
}

// GET /api/prompts — return all prompts
export async function GET() {
    try {
        const prompts = await prisma.prompt.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(prompts);
    } catch (error) {
        console.error('[GET /api/prompts]', error);
        return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
    }
}

// POST /api/prompts — create a prompt (admin only)
export async function POST(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { line1, line2, line2Color, type, aspectRatio, prompt, image } = body;

        if (!line1 || !line2 || !prompt || !image) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newPrompt = await prisma.prompt.create({
            data: {
                line1: line1.toUpperCase(),
                line2: line2.toUpperCase(),
                line2Color: line2Color || '#ff2d78',
                type: type || 'image',
                aspectRatio: aspectRatio || '9:16',
                prompt,
                image,
            },
        });

        return NextResponse.json(newPrompt, { status: 201 });
    } catch (error) {
        console.error('[POST /api/prompts]', error);
        return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
    }
}
