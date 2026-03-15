import { NextRequest, NextResponse } from 'next/server';

// POST /api/upload — upload image to Cloudinary via direct REST API
export async function POST(request: NextRequest) {
    try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            console.error('[POST /api/upload] Missing Cloudinary env vars:', {
                cloudName: !!cloudName,
                apiKey: !!apiKey,
                apiSecret: !!apiSecret,
            });
            return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Build upload form for Cloudinary REST API
        const timestamp = Math.round(Date.now() / 1000);
        const folder = 'visionary-burma';

        // Generate signature using SubtleCrypto (works in all Next.js runtimes)
        const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const msgBuffer = new TextEncoder().encode(signatureString);
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Build multipart form
        const uploadForm = new FormData();
        uploadForm.append('file', file);
        uploadForm.append('api_key', apiKey);
        uploadForm.append('timestamp', String(timestamp));
        uploadForm.append('folder', folder);
        uploadForm.append('signature', signature);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: 'POST', body: uploadForm }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('[POST /api/upload] Cloudinary error:', data);
            return NextResponse.json({ error: data.error?.message || 'Upload failed' }, { status: 500 });
        }

        return NextResponse.json({ url: data.secure_url, publicId: data.public_id });
    } catch (error) {
        console.error('[POST /api/upload] Exception:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
