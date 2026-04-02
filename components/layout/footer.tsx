'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'

interface FooterLink {
  label: string
  href: string
}

interface FooterProps {
  brandName?: string
  links?: FooterLink[]
}

export function Footer({
  brandName = 'Toolk1t',
  links = [
    { label: 'Blog', href: '/blog' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Contact Support', href: '/contact' },
  ],
}: FooterProps) {
  useEffect(() => {
    // Initialize Shielded embed once the script has loaded
    const el = document.getElementById('shielded-logo')
    if (el && typeof (window as any).ds07o6pcmkorn !== 'undefined') {
      const frameName = new (window as any).ds07o6pcmkorn({
        openElementId: '#shielded-logo',
        modalID: 'modal',
      })
      frameName.init()
    }
  }, [])

  function handleShieldedReady() {
    const el = document.getElementById('shielded-logo')
    if (el && typeof (window as any).ds07o6pcmkorn !== 'undefined') {
      const frameName = new (window as any).ds07o6pcmkorn({
        openElementId: '#shielded-logo',
        modalID: 'modal',
      })
      frameName.init()
    }
  }

  return (
    <footer className="mt-auto py-4 px-6 border-t border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 opacity-50">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            &copy; {new Date().getFullYear()} {brandName}
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:gap-8">
          {links.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="text-sm text-slate-500 hover:text-[var(--tk-color-primary-500)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {/* Shielded Site — inline with links on desktop */}
          <a
            href="#"
            id="shielded-logo"
            title="Shielded Site — support for those experiencing family violence"
          >
            <img
              src="https://shielded.co.nz/img/custom-logo.png"
              alt="Shielded Site"
              width={28}
              height={28}
              className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            />
          </a>
        </div>
      </div>

      <Script
        src="https://staticcdn.co.nz/embed/embed.js"
        strategy="lazyOnload"
        onLoad={handleShieldedReady}
      />
    </footer>
  )
}
