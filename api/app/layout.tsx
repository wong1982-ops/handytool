export const metadata = {
  title: 'HandyTool API',
  description: 'HandyTool API Service',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
