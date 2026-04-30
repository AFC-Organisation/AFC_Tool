import { useState } from 'react'
import { useAuth } from '../context/Authcontext'
import { AlertCircle, ArrowRight, Lock } from 'lucide-react'

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
      className="min-h-screen w-full flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── LEFT PANEL — brand identity ───────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col relative overflow-hidden"
        style={{ backgroundColor: '#041c3a' }}
      >
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Orange accent — bottom right geometric block */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: 0,
            right: 0,
            width: '42%',
            height: '38%',
            background: 'linear-gradient(135deg, transparent 40%, rgba(237,100,37,0.12) 100%)',
          }}
        />

        {/* Thin orange vertical rule — far right edge */}
        <div
          className="absolute right-0 top-0 bottom-0 w-px pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(237,100,37,0.4) 40%, rgba(237,100,37,0.4) 60%, transparent)' }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-14 py-12">

          {/* Logo + name */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
              style={{ backgroundColor: '#ed6425' }}
            >
              <span
                className="text-white text-[13px] tracking-widest"
                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}
              >
                AFC
              </span>
            </div>
            <span
              className="text-white text-[13px] tracking-[0.18em] uppercase"
              style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em' }}
            >
              Academics for Companies
            </span>
          </div>

          {/* Central wordmark */}
          <div className="flex-1 flex flex-col justify-center">
            <p
              className="text-[11px] uppercase tracking-[0.25em] mb-6"
              style={{ color: '#ed6425' }}
            >
              Staff &amp; Leden portaal
            </p>
            <h1
              className="text-white leading-[1.05] mb-8"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(52px, 5.5vw, 80px)',
                letterSpacing: '1px',
              }}
            >
              Beheer&shy;portaal
            </h1>
            <p
              className="text-[15px] leading-relaxed max-w-[340px]"
              style={{ color: 'rgba(255,255,255,0.38)' }}
            >
              Het centrale platform voor evenementen, inschrijvingen
              en strategische analyses van AFC Gent.
            </p>
          </div>

          {/* Footer */}
          <p
            className="text-[11px]"
            style={{ color: 'rgba(255,255,255,0.18)' }}
          >
            © {new Date().getFullYear()} Academics for Companies
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — login form ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white">

        {/* Mobile-only top bar */}
        <div
          className="lg:hidden flex items-center gap-2.5 px-6 py-4 border-b border-zinc-100"
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-md"
            style={{ backgroundColor: '#ed6425' }}
          >
            <span
              className="text-white text-[10px]"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1.5px' }}
            >
              AFC
            </span>
          </div>
          <span className="text-xs font-medium text-zinc-400 tracking-wider uppercase">
            Academics for Companies
          </span>
        </div>

        {/* Form area — vertically centered */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-[360px]">

            {/* Heading */}
            <div className="mb-10">
              <h2
                className="text-[28px] font-semibold tracking-tight mb-2"
                style={{ color: '#041c3a' }}
              >
                Aanmelden
              </h2>
              <p className="text-[13px] text-zinc-400 leading-relaxed">
                Gebruik je{' '}
                <span className="font-medium" style={{ color: '#ed6425' }}>
                  @afcgent.be
                </span>{' '}
                Microsoft-account om aan te melden.
              </p>
            </div>

            {/* Error */}
            {fout && (
              <div
                className="flex items-start gap-2.5 rounded-lg px-3.5 py-3 mb-6 text-[13px]"
                style={{
                  backgroundColor: 'rgba(237,100,37,0.07)',
                  border: '1px solid rgba(237,100,37,0.25)',
                  color: '#c2410c',
                }}
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{fout}</span>
              </div>
            )}

            {/* Microsoft button */}
            <button
              onClick={handleMicrosoft}
              disabled={laden}
              className="w-full h-12 flex items-center gap-3 px-4 rounded-xl text-[13.5px] font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group"
              style={{
                backgroundColor: '#041c3a',
                color: 'white',
                border: '1px solid #041c3a',
              }}
              onMouseEnter={e => {
                if (!laden) e.currentTarget.style.backgroundColor = '#062858'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#041c3a'
              }}
            >
              {/* Microsoft logo */}
              <svg width="17" height="17" viewBox="0 0 21 21" fill="none" className="shrink-0">
                <rect x="1"  y="1"  width="9" height="9" fill="#f25022" />
                <rect x="11" y="1"  width="9" height="9" fill="#7fba00" />
                <rect x="1"  y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>

              <span className="flex-1 text-left">
                {laden ? 'Bezig met aanmelden…' : 'Doorgaan met Microsoft'}
              </span>

              {laden ? (
                <svg className="h-4 w-4 animate-spin opacity-60" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-zinc-100" />
              <span className="text-[11px] text-zinc-300 uppercase tracking-widest"></span>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>

            {/* Access restriction notice */}
            <div
              className="flex items-start gap-3 rounded-xl px-4 py-3.5"
              style={{ backgroundColor: '#f8f9fb', border: '1px solid #eef0f4' }}
            >
              <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-zinc-400" />
              <p className="text-[12px] text-zinc-400 leading-relaxed">
                Toegang is beperkt tot{' '}
                <span
                  className="font-semibold rounded px-1 py-0.5 text-[11px]"
                  style={{
                    backgroundColor: 'rgba(237,100,37,0.1)',
                    color: '#c2410c',
                  }}
                >
                  @afcgent.be
                </span>{' '}
                accounts. Neem contact op met een beheerder als je geen toegang hebt.
              </p>
            </div>

          </div>
        </div>

        {/* Bottom bar — mobile copyright */}
        <div className="lg:hidden px-8 pb-6">
          <p className="text-[11px] text-zinc-300">
            © {new Date().getFullYear()} Academics for Companies
          </p>
        </div>
      </div>
    </div>
  )
}