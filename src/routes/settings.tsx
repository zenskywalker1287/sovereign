import { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ListGroup, Row, Button, Card, Switch } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { getSettings, saveSettings, MODELS, type Provider } from '@/domain/grading';
import { wipeAllData } from '@/auth/passcode';
import { getTheme, setTheme, type ThemePref } from '@/domain/appearance';
import { getNotifPrefs, saveNotifPrefs, permission, requestPermission, fireTest, scheduleDaily, type Permission } from '@/domain/notifications';

export const Route = createFileRoute('/settings')({ component: Settings });

function Settings() {
  const initial = getSettings();
  const [provider, setProvider] = useState<Provider>(initial.provider);
  const [modelId, setModelId] = useState(initial.modelId);
  const [openrouterKey, setOR] = useState(initial.openrouterKey);
  const [geminiKey, setGemini] = useState(initial.geminiKey);
  const [openaiKey, setOpenAI] = useState(initial.openaiKey);
  const [showOR, setShowOR] = useState(false);
  const [showGM, setShowGM] = useState(false);
  const [showOA, setShowOA] = useState(false);

  // Appearance
  const [theme, setThemeState] = useState<ThemePref>(() => getTheme());
  function pickTheme(t: ThemePref) {
    setThemeState(t);
    setTheme(t);
  }

  // Notifications
  const [notif, setNotif] = useState(() => getNotifPrefs());
  const [perm, setPerm] = useState<Permission>(() => permission());
  async function askPerm() {
    const result = await requestPermission();
    setPerm(result);
    if (result === 'granted' && notif.enabled) scheduleDaily();
  }
  function toggleNotif(enabled: boolean) {
    saveNotifPrefs({ enabled });
    setNotif({ ...notif, enabled });
    if (enabled && perm === 'granted') scheduleDaily();
  }
  function pickTime(reminderTime: string) {
    saveNotifPrefs({ reminderTime });
    setNotif({ ...notif, reminderTime });
  }

  // Honor a hash anchor when arriving from Profile → Appearance / Notifications
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);
  const [saved, setSaved] = useState(false);

  const availableModels = MODELS.filter(m => m.provider === provider);
  const currentModelExistsInProvider = availableModels.some(m => m.id === modelId);

  function persist(next: Partial<{ provider: Provider; modelId: string; openrouterKey: string; geminiKey: string; openaiKey: string }>) {
    saveSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function onProviderChange(p: Provider) {
    setProvider(p);
    const firstModel = MODELS.find(m => m.provider === p)?.id ?? modelId;
    setModelId(firstModel);
    persist({ provider: p, modelId: firstModel });
  }

  return (
    <div className="pb-16">
      {/* Header */}
      <header className="safe-top px-5 pt-3 pb-2 flex items-center justify-between">
        <Link to="/me" className="ios-body flex items-center gap-1" style={{ color: 'var(--tint)' }}>
          <Icon name="chevron-left" size={16} /> Me
        </Link>
        <h1 className="ios-headline" style={{ color: 'var(--label)' }}>Settings</h1>
        <div className="w-12 text-right">
          {saved && <span className="ios-footnote" style={{ color: 'var(--green)' }}>Saved</span>}
        </div>
      </header>

      <h1 className="ios-large-title px-5 pt-2 pb-3" style={{ color: 'var(--label)' }}>Settings</h1>

      {/* Provider */}
      <ListGroup header="Grading Provider" footer="OpenRouter unlocks free open-source models. Gemini works directly with a Google AI Studio key.">
        <Row
          leading={<Dot color={provider === 'openrouter' ? 'var(--tint)' : 'transparent'} />}
          title="OpenRouter (recommended)"
          subtitle="Llama, DeepSeek, Qwen, Gemini — many free models"
          onClick={() => onProviderChange('openrouter')}
        />
        <Row
          leading={<Dot color={provider === 'gemini' ? 'var(--tint)' : 'transparent'} />}
          title="Google Gemini direct"
          subtitle="Direct API. Image gen needs billing; text + video on free tier"
          onClick={() => onProviderChange('gemini')}
        />
      </ListGroup>

      {/* Model */}
      <ListGroup header="Model">
        {availableModels.map(m => (
          <Row
            key={m.id}
            leading={<Dot color={m.id === modelId ? 'var(--tint)' : 'transparent'} />}
            title={m.label}
            subtitle={m.hint}
            onClick={() => { setModelId(m.id); persist({ modelId: m.id }); }}
          />
        ))}
        {!currentModelExistsInProvider && availableModels[0] && (
          <Row
            leading={<Icon name="arrow-right" size={14} />}
            title={`Switch to ${availableModels[0].label}`}
            subtitle="Current model belongs to the other provider"
            onClick={() => { setModelId(availableModels[0].id); persist({ modelId: availableModels[0].id }); }}
          />
        )}
      </ListGroup>

      {/* OpenRouter key */}
      <section className="px-4 mb-6">
        <div className="px-4 mb-1.5 ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>OpenRouter API Key</div>
        <Card>
          <input
            type={showOR ? 'text' : 'password'}
            value={openrouterKey}
            onChange={e => setOR(e.target.value)}
            placeholder="sk-or-v1-..."
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full bg-transparent ios-body outline-none font-mono"
            style={{ color: 'var(--label)' }}
          />
          <div className="flex items-center gap-3 mt-3">
            <button className="ios-footnote" style={{ color: 'var(--tint)' }} onClick={() => setShowOR(s => !s)}>
              {showOR ? 'Hide' : 'Show'}
            </button>
            <a className="ios-footnote" style={{ color: 'var(--tint)' }}
               href="https://openrouter.ai/keys" target="_blank" rel="noopener">
              Get a key
            </a>
            <div className="flex-1" />
            <Button variant="tinted" size="md" onClick={() => persist({ openrouterKey })}>Save</Button>
          </div>
        </Card>
        <div className="px-4 mt-1.5 ios-footnote" style={{ color: 'var(--label-secondary)' }}>
          Stored locally on this device only.
        </div>
      </section>

      {/* Gemini key */}
      <section className="px-4 mb-6">
        <div className="px-4 mb-1.5 ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>Gemini API Key</div>
        <Card>
          <input
            type={showGM ? 'text' : 'password'}
            value={geminiKey}
            onChange={e => setGemini(e.target.value)}
            placeholder="AIza..."
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full bg-transparent ios-body outline-none font-mono"
            style={{ color: 'var(--label)' }}
          />
          <div className="flex items-center gap-3 mt-3">
            <button className="ios-footnote" style={{ color: 'var(--tint)' }} onClick={() => setShowGM(s => !s)}>
              {showGM ? 'Hide' : 'Show'}
            </button>
            <a className="ios-footnote" style={{ color: 'var(--tint)' }}
               href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">
              Get a key
            </a>
            <div className="flex-1" />
            <Button variant="tinted" size="md" onClick={() => persist({ geminiKey })}>Save</Button>
          </div>
        </Card>
      </section>

      {/* OpenAI key (Whisper) */}
      <section className="px-4 mb-6">
        <div className="px-4 mb-1.5 ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>OpenAI API Key (Whisper transcription)</div>
        <Card>
          <input
            type={showOA ? 'text' : 'password'}
            value={openaiKey}
            onChange={e => setOpenAI(e.target.value)}
            placeholder="sk-proj-..."
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full bg-transparent ios-body outline-none font-mono"
            style={{ color: 'var(--label)' }}
          />
          <div className="flex items-center gap-3 mt-3">
            <button className="ios-footnote" style={{ color: 'var(--tint)' }} onClick={() => setShowOA(s => !s)}>
              {showOA ? 'Hide' : 'Show'}
            </button>
            <a className="ios-footnote" style={{ color: 'var(--tint)' }}
               href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">
              Get a key
            </a>
            <div className="flex-1" />
            <Button variant="tinted" size="md" onClick={() => persist({ openaiKey })}>Save</Button>
          </div>
        </Card>
        <div className="px-4 mt-1.5 ios-footnote" style={{ color: 'var(--label-secondary)' }}>
          Used by the local `transcribe_url.py` script for IG/X/TikTok video transcription via Whisper. Stays on this device.
        </div>
      </section>

      {/* Appearance */}
      <section id="appearance" className="px-4 mb-6 scroll-mt-20">
        <div className="px-4 mb-1.5 ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>Appearance</div>
        <div className="ios-list">
          <Row
            leading={<Dot color={theme === 'system' ? 'var(--tint)' : 'transparent'} />}
            title="System"
            subtitle="Follow your iOS / macOS theme"
            onClick={() => pickTheme('system')}
          />
          <Row
            leading={<Dot color={theme === 'light' ? 'var(--tint)' : 'transparent'} />}
            title="Light"
            subtitle="Cream + black"
            onClick={() => pickTheme('light')}
          />
          <Row
            leading={<Dot color={theme === 'dark' ? 'var(--tint)' : 'transparent'} />}
            title="Dark"
            subtitle="OLED black + white"
            onClick={() => pickTheme('dark')}
          />
        </div>
      </section>

      {/* Notifications */}
      <section id="notifications" className="px-4 mb-6 scroll-mt-20">
        <div className="px-4 mb-1.5 ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>Notifications</div>
        <Card>
          {perm === 'unavailable' ? (
            <div className="ios-body" style={{ color: 'var(--label-secondary)' }}>
              Your browser does not support notifications. (Try installing as a PWA on your iPhone Home Screen.)
            </div>
          ) : perm === 'denied' ? (
            <div className="ios-body" style={{ color: 'var(--red)' }}>
              You blocked notifications for this site. Open browser settings → Notifications → allow this site, then come back.
            </div>
          ) : perm === 'default' ? (
            <div>
              <p className="ios-body mb-3" style={{ color: 'var(--label)' }}>
                Get a daily reminder to lock in. Permission is required first.
              </p>
              <Button variant="filled" onClick={askPerm}>Enable notifications</Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="ios-body" style={{ color: 'var(--label)' }}>Daily reminder</div>
                <Switch
                  on={notif.enabled}
                  onChange={toggleNotif}
                />
              </div>
              {notif.enabled && (
                <div className="flex items-center justify-between mb-3">
                  <div className="ios-body" style={{ color: 'var(--label)' }}>Time</div>
                  <input
                    type="time"
                    value={notif.reminderTime}
                    onChange={e => pickTime(e.target.value)}
                    className="ios-body font-mono bg-transparent outline-none"
                    style={{ color: 'var(--label)' }}
                  />
                </div>
              )}
              <Button variant="tinted" size="md" onClick={fireTest}>Test notification</Button>
            </div>
          )}
        </Card>
        <div className="px-4 mt-1.5 ios-footnote" style={{ color: 'var(--label-secondary)' }}>
          v1 reminders fire only while the app is open. Background push (works when closed) needs a backend — coming later.
        </div>
      </section>

      <ListGroup header="About">
        <Row title="Version" trailing="0.3.0 alpha" />
        <Row title="Storage" subtitle="Local (browser/device)" trailing="—" />
      </ListGroup>

      <section className="px-4 mb-12">
        <div className="px-4 mb-1.5 ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>Danger zone</div>
        <Card>
          <div className="ios-headline" style={{ color: 'var(--label)' }}>Wipe all device data</div>
          <div className="ios-footnote mt-1" style={{ color: 'var(--label-secondary)' }}>
            Erases passcode, settings, missions, XP, drafts and graded results stored on THIS device.
            Obsidian vault files (when wired) are not touched.
          </div>
          <div className="mt-3 flex">
            <button
              onClick={() => {
                if (!confirm('Wipe ALL SOVEREIGN data on this device? This cannot be undone.')) return;
                wipeAllData();
                location.reload();
              }}
              className="h-[44px] px-4 rounded-[12px] ios-headline active:opacity-70"
              style={{ background: 'var(--red)', color: 'white' }}
            >
              Wipe data
            </button>
          </div>
        </Card>
      </section>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
         style={{ borderColor: color === 'transparent' ? 'var(--label-quaternary)' : color }}>
      {color !== 'transparent' && <div className="w-2 h-2 rounded-full" style={{ background: color }} />}
    </div>
  );
}
