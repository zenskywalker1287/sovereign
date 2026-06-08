import { useEffect, useRef, useState } from 'react';
import {
  isPasscodeSet, setPasscode, verifyPasscode, isUnlocked,
  lockoutRemainingMs, failedAttempts, wipeAllData,
} from './passcode';

const PIN_LEN = 4;

export function Lock({ onUnlocked }: { onUnlocked: () => void }) {
  // Two modes: 'set' (first launch — choose + confirm a PIN), 'enter' (returning user)
  const [mode, setMode] = useState<'set' | 'enter'>(() => (isPasscodeSet() ? 'enter' : 'set'));
  const [step, setStep] = useState<'choose' | 'confirm'>('choose'); // only meaningful when mode==='set'
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lockoutMs, setLockoutMs] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus + auto-attempt when length hits PIN_LEN
  useEffect(() => { inputRef.current?.focus(); }, [mode, step]);
  useEffect(() => { if (pin.length === PIN_LEN) submit(); /* eslint-disable-next-line */ }, [pin]);

  // Lockout countdown
  useEffect(() => {
    if (lockoutMs <= 0) return;
    const i = setInterval(() => {
      const r = lockoutRemainingMs();
      setLockoutMs(r);
      if (r === 0) clearInterval(i);
    }, 250);
    return () => clearInterval(i);
  }, [lockoutMs]);

  useEffect(() => {
    const r = lockoutRemainingMs();
    if (r > 0) setLockoutMs(r);
  }, []);

  async function submit() {
    setError(null);
    if (mode === 'set') {
      if (!/^\d{4}$/.test(pin)) { setError('PIN must be 4 digits.'); setPin(''); return; }
      if (step === 'choose') {
        setFirstPin(pin);
        setPin('');
        setStep('confirm');
        return;
      }
      // step === 'confirm'
      if (pin !== firstPin) {
        setError('PINs did not match. Try again.');
        setPin(''); setFirstPin(''); setStep('choose');
        return;
      }
      await setPasscode(pin);
      onUnlocked();
      return;
    }
    // mode === 'enter'
    const ok = await verifyPasscode(pin);
    if (ok) { onUnlocked(); return; }
    const r = lockoutRemainingMs();
    if (r > 0) { setLockoutMs(r); setError('Too many attempts. Locked.'); }
    else setError(`Wrong PIN. ${PIN_LEN === 4 ? '' : ''}${failedAttempts() ? `(${failedAttempts()}/5)` : ''}`);
    setPin('');
  }

  function onReset() {
    if (!confirm('Wipe ALL SOVEREIGN data on this device (settings, graded files, XP, missions)?\n\nObsidian vault files are NOT touched.')) return;
    wipeAllData();
    setMode('set'); setStep('choose');
    setPin(''); setFirstPin(''); setError(null); setLockoutMs(0);
  }

  const heading =
    mode === 'set' && step === 'choose'  ? 'Set a passcode' :
    mode === 'set' && step === 'confirm' ? 'Confirm passcode' :
                                           'Welcome back';
  const sub =
    mode === 'set' && step === 'choose'  ? '4 digits. You will type this every launch.' :
    mode === 'set' && step === 'confirm' ? 'Enter the same 4 digits again.' :
    lockoutMs > 0                        ? `Locked for ${Math.ceil(lockoutMs / 1000)}s` :
                                           'Enter your passcode';

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center safe-top safe-bottom"
      style={{ background: 'var(--bg-grouped)' }}
    >
      <div className="ios-large-title" style={{ color: 'var(--label)' }}>SOVEREIGN</div>
      <div className="ios-headline mt-1 mb-10" style={{ color: 'var(--label)' }}>{heading}</div>

      <div className="flex gap-3 mb-2">
        {Array.from({ length: PIN_LEN }).map((_, i) => (
          <div key={i}
               className="w-3.5 h-3.5 rounded-full"
               style={{ background: i < pin.length ? 'var(--label)' : 'transparent', border: '1.5px solid var(--label)' }} />
        ))}
      </div>

      <div className="ios-footnote h-5 mb-2" style={{ color: error ? 'var(--red)' : 'var(--label-secondary)' }}>
        {error ?? sub}
      </div>

      {/* Hidden native input for keyboard input on mobile */}
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={PIN_LEN}
        value={pin}
        onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, PIN_LEN))}
        disabled={lockoutMs > 0}
        className="absolute opacity-0 pointer-events-none"
        autoFocus
      />

      {/* Numeric keypad */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        {['1','2','3','4','5','6','7','8','9'].map(d => (
          <Key key={d} d={d} onClick={() => lockoutMs === 0 && setPin(p => (p.length < PIN_LEN ? p + d : p))} />
        ))}
        <div />
        <Key d="0" onClick={() => lockoutMs === 0 && setPin(p => (p.length < PIN_LEN ? p + '0' : p))} />
        <Key
          d="⌫"
          onClick={() => lockoutMs === 0 && setPin(p => p.slice(0, -1))}
          ghost
        />
      </div>

      {mode === 'enter' && (
        <button
          onClick={onReset}
          className="mt-10 ios-footnote"
          style={{ color: 'var(--label-secondary)' }}
        >
          Forgot? Reset device data
        </button>
      )}
    </div>
  );
}

function Key({ d, onClick, ghost }: { d: string; onClick: () => void; ghost?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="w-[72px] h-[72px] rounded-full ios-title-2 font-light active:opacity-60 transition-opacity no-select"
      style={{
        background: ghost ? 'transparent' : 'var(--fill-tertiary)',
        color: 'var(--label)',
      }}
    >
      {d}
    </button>
  );
}
