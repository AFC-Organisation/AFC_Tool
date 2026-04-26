import { useState } from 'react'
import { useAuth } from '../context/Authcontext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const { loginWithMicrosoft } = useAuth()
  const [laden, setLaden] = useState(false)
  const [fout, setFout] = useState('')

  const handleMicrosoft = async () => {
    setFout('')
    setLaden(true)
    try {
      await loginWithMicrosoft()
    } catch {
      setFout('Aanmelden mislukt. Probeer opnieuw.')
      setLaden(false)
    }
  }

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4 py-10"
      style={{ backgroundColor: '#041c3a', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Background ──────────────────────────────────────── */}

      {/* Deep navy-to-black vignette base */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 40%, #062447 0%, #041c3a 45%, #020f20 100%)',
        }}
      />

      {/* Large soft orange orb — top right, very diffuse */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: '-10%',
          right: '-8%',
          width: '55vw',
          height: '55vw',
          maxWidth: 700,
          maxHeight: 700,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(237,100,37,0.13) 0%, rgba(237,100,37,0.04) 40%, transparent 68%)',
          filter: 'blur(12px)',
        }}
      />

      {/* Medium blue orb — bottom left, atmospheric depth */}
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: '-12%',
          left: '-6%',
          width: '45vw',
          height: '45vw',
          maxWidth: 560,
          maxHeight: 560,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(6,56,110,0.7) 0%, transparent 65%)',
          filter: 'blur(18px)',
        }}
      />

      {/* Thin diagonal light streak — top left, adds visual interest */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(118deg, rgba(255,255,255,0.025) 0%, transparent 35%)',
        }}
      />

      {/* ── Card ────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* ── Floating brand block — sits above the card ─── */}
        <div className="flex flex-col items-center mb-6 gap-3">
          {/* Logo circle with orange glow */}
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, #f07030 0%, #c9511a 100%)',
              boxShadow:
                '0 0 0 6px rgba(237,100,37,0.12), 0 0 0 12px rgba(237,100,37,0.06), 0 8px 28px rgba(237,100,37,0.4)',
            }}
          >
            <span
              className="text-white text-[18px] tracking-widest"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2.5px' }}
            >
              AFC
            </span>
          </div>

          {/* Brand name + tagline */}
          <div className="text-center">
            <p
              className="text-white text-[22px] tracking-widest leading-none"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Academics for Companies
            </p>
            <p className="text-[11px] mt-1.5 tracking-wide uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Leden &amp; Staff portaal
            </p>
          </div>
        </div>

        <Card
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(8,32,62,0.75)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow:
              '0 2px 0 rgba(237,100,37,0.35), 0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <CardContent className="px-8 pt-7 pb-8 space-y-6">

            {/* ── Heading ─────────────────────────────────── */}
            <div className="space-y-1">
              <h1 className="text-[22px] font-semibold text-white tracking-tight">
                Welkom terug
              </h1>
              <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
                Meld je aan met je{' '}
                <span style={{ color: '#ed6425' }}>@afcgent.be</span>{' '}
                account om verder te gaan.
              </p>
            </div>

            {/* ── Error alert ─────────────────────────────── */}
            {fout && (
              <Alert
                className="border rounded-xl py-3 px-4 animate-in fade-in duration-200"
                style={{
                  backgroundColor: 'rgba(237,100,37,0.1)',
                  borderColor: 'rgba(237,100,37,0.35)',
                }}
              >
                <AlertCircle
                  className="h-4 w-4 shrink-0"
                  style={{ color: '#ed6425' }}
                />
                <AlertDescription
                  className="text-sm ml-2"
                  style={{ color: '#ed6425' }}
                >
                  {fout}
                </AlertDescription>
              </Alert>
            )}

            {/* ── Microsoft sign-in button ─────────────────── */}
            <Button
              onClick={handleMicrosoft}
              disabled={laden}
              variant="outline"
              className="
                w-full h-12 flex items-center justify-center gap-3
                rounded-xl text-sm font-medium text-white
                transition-all duration-200
                hover:scale-[1.015] active:scale-[0.99]
                disabled:opacity-50 disabled:cursor-not-allowed
                group
              "
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderColor: 'rgba(255,255,255,0.12)',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={e => {
                if (!laden) {
                  e.currentTarget.style.backgroundColor = 'rgba(237,100,37,0.12)'
                  e.currentTarget.style.borderColor = 'rgba(237,100,37,0.4)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              }}
            >
              {/* Microsoft logo */}
              <svg width="18" height="18" viewBox="0 0 21 21" fill="none" className="shrink-0">
                <rect x="1"  y="1"  width="9" height="9" fill="#f25022" />
                <rect x="11" y="1"  width="9" height="9" fill="#7fba00" />
                <rect x="1"  y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>

              <span className="flex-1 text-left">
                {laden ? 'Bezig met aanmelden…' : 'Aanmelden met Microsoft'}
              </span>

              {!laden && (
                <ArrowRight
                  className="h-4 w-4 opacity-40 group-hover:opacity-80 transition-opacity"
                  style={{ color: '#ed6425' }}
                />
              )}

              {laden && (
                <svg
                  className="h-4 w-4 animate-spin opacity-60"
                  style={{ color: '#ed6425' }}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
            </Button>

            {/* ── Info badge row ───────────────────────────── */}
            <div
              className="flex items-start gap-3 rounded-xl p-3.5"
              style={{
                backgroundColor: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <ShieldCheck
                className="h-4 w-4 mt-0.5 shrink-0"
                style={{ color: 'rgba(237,100,37,0.6)' }}
              />
              <p
                className="text-[12px] leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Alleen{' '}
                <Badge
                  className="text-[11px] px-1.5 py-0 rounded-md font-medium mx-0.5"
                  style={{
                    backgroundColor: 'rgba(237,100,37,0.15)',
                    color: 'rgba(237,100,37,0.9)',
                    border: '1px solid rgba(237,100,37,0.25)',
                  }}
                >
                  @afcgent.be
                </Badge>{' '}
                accounts hebben toegang tot dit portaal.
              </p>
            </div>

          </CardContent>
        </Card>

        {/* ── Footer ──────────────────────────────────────── */}
        <p
          className="text-center text-[11px] mt-5"
          style={{ color: 'rgba(255,255,255,0.13)' }}
        >
          © {new Date().getFullYear()} Academics for Companies — Alle rechten voorbehouden
        </p>
      </div>
    </div>
  )
}