import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  
  // Redirigir directamente a la página del doctor
  // La página /dr/[slug] ya maneja el caso de doctor no encontrado
  const redirectUrl = new URL(`/dr/${slug}`, request.url)
  
  return NextResponse.redirect(redirectUrl, { status: 307 })
}
