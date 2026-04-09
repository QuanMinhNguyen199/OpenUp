// frontend/middleware.ts
import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return createClient(request)
}

export const config = {
  matcher: [
    // Áp dụng cho tất cả các trang trừ file tĩnh (ảnh, favicon, etc.)
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}