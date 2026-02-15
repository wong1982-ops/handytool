import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // API-only: no UI needed
  serverExternalPackages: ['pdfjs-dist', 'exceljs', 'docx', 'jspdf', 'jszip', '@neplex/vectorizer'],
}

export default nextConfig
