import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    console.log('Received form data:', Object.fromEntries(formData.entries()));

    const file = formData.get('File') as File;
    if (!file) {
      throw new Error('No file uploaded');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size exceeds 10MB limit');
    }

    // 파일을 Blob으로 변환
    const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });

    const webhookFormData = new FormData();
    webhookFormData.append('Startup Name', formData.get('Startup Name') as string);
    webhookFormData.append('Email to receive the evaluation result', formData.get('Email to receive the evaluation result') as string);
    webhookFormData.append('File', fileBlob, file.name);
    webhookFormData.append('submittedAt', formData.get('submittedAt') as string);
    webhookFormData.append('formMode', formData.get('formMode') as string);

    // AbortController로 타임아웃 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60초 타임아웃

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_WEBHOOK_URL!, {
        method: 'POST',
        body: webhookFormData,
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Webhook error:', errorText);
        throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Webhook response:', data);

      return NextResponse.json(data);
    } catch (fetchError: any) {
      if (fetchError?.name === 'AbortError') {
        throw new Error('Request timed out after 60 seconds');
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 