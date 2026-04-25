import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()
  
  // Obtener la URL base
  const baseUrl = request.nextUrl.origin
  
  // Verificar que el doctor existe
  const { data: doctor } = await supabase
    .from('doctors')
    .select('slug')
    .eq('slug', slug)
    .single()
  
  if (doctor) {
    return NextResponse.redirect(new URL(`/dr/${slug}`, baseUrl))
  }
  
  // Si no existe, redirigir a la página principal
  return NextResponse.redirect(new URL('/', baseUrl))
}
