import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { content } from './lib/content'
import type { Language, ServiceId } from './lib/content'
import { shopConfig } from './config'
import { createWhatsAppUrl, validateRequest } from './lib/whatsapp'
import type { RepairRequest } from './lib/whatsapp'
import Icon from './components/Icon'
import FallbackScene from './components/FallbackScene'

const DeviceScene = lazy(() => import('./components/DeviceScene'))

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function readLanguage(): Language {
  try { return localStorage.getItem('atelier-language') === 'ar' ? 'ar' : 'fr' } catch { return 'fr' }
}

const blankRequest: RepairRequest = { name: '', device: '', model: '', problem: '' }

export default function App() {
  const [language, setLanguage] = useState<Language>(readLanguage)
  const [activeService, setActiveService] = useState<ServiceId>('screen')
  const [progress, setProgress] = useState(0)
  const [manualProgress, setManualProgress] = useState<number | null>(null)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [webGLUnavailable, setWebGLUnavailable] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [request, setRequest] = useState<RepairRequest>(blankRequest)
  const [errors, setErrors] = useState<Partial<Record<keyof RepairRequest | 'whatsapp', string>>>({})
  const experienceRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const navigationRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const t = content[language]
  const active = t.services.find(service => service.id === activeService)!
  const actualProgress = reducedMotion ? 0 : manualProgress ?? progress
  const whatsappUrl = createWhatsAppUrl(undefined, language)
  const handleUnavailable = useCallback(() => setWebGLUnavailable(true), [])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.title = `${shopConfig.name} — ${language === 'fr' ? 'À l’intérieur de la réparation' : 'الإصلاح من الداخل'}`
    try { localStorage.setItem('atelier-language', language) } catch { /* Storage is optional. */ }
    setErrors({})
  }, [language])

  useEffect(() => {
    if (!menuOpen) return
    navigationRef.current?.querySelector('a')?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    let frame = 0
    let previousScroll = window.scrollY
    const update = () => {
      frame = 0
      const element = experienceRef.current
      if (!element) return
      const box = element.getBoundingClientRect()
      const start = box.top + window.scrollY
      const distance = Math.max(360, box.height - window.innerHeight + 30)
      setProgress(Math.max(0, Math.min(1, (window.scrollY - start + 80) / distance)))
      if (Math.abs(window.scrollY - previousScroll) > 4) setManualProgress(null)
      previousScroll = window.scrollY
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [language])

  const setField = (field: keyof RepairRequest, value: string) => {
    setRequest(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: undefined, whatsapp: undefined }))
  }

  const selectService = (id: ServiceId) => {
    setActiveService(id)
    if (!reducedMotion) setManualProgress(1)
  }

  const submitRequest = (event: FormEvent) => {
    event.preventDefault()
    const validation = validateRequest(request, language)
    const url = createWhatsAppUrl(request, language)
    if (!url && Object.keys(validation).length === 0) validation.whatsapp = t.formErrors.whatsapp
    setErrors(validation)
    const firstField = Object.keys(validation).find(key => key !== 'whatsapp')
    if (firstField) formRef.current?.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus()
    if (Object.keys(validation).length === 0 && url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  const fallback = <FallbackScene title={t.fallbackTitle} description={t.fallbackDescription} />
  const numberIsConfigured = /^\+?[\d\s()-]{8,20}$/.test(shopConfig.phone)

  return <>
    <a href="#main" className="skip-link">{t.skipLink}</a>
    <header className="header">
      <div className="header-inner">
        <a className="brand" href="#" aria-label={shopConfig.name}>
          <span className="brand-symbol" aria-hidden="true"><i /><i /><i /><i /></span>
          <span>{shopConfig.name.split(' ').slice(0, -1).join(' ')} <strong>{shopConfig.name.split(' ').at(-1)}</strong><span className="brand-dot">.</span></span>
        </a>
        <nav ref={navigationRef} id="mobile-navigation" className={`navigation ${menuOpen ? 'is-open' : ''}`} aria-label={t.navigationLabel}>
          <a href="#inside" onClick={() => setMenuOpen(false)}>{t.nav.inside}</a>
          <a href="#process" onClick={() => setMenuOpen(false)}>{t.nav.process}</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>{t.nav.contact}</a>
        </nav>
        <div className="header-tools">
          <span className="location"><Icon name="pin" />{shopConfig.location[language]}</span>
          <div className="language-switch" aria-label={t.languageLabel}>
            <button type="button" lang="fr" aria-pressed={language === 'fr'} onClick={() => setLanguage('fr')}>FR</button>
            <span aria-hidden="true">/</span>
            <button type="button" lang="ar" aria-pressed={language === 'ar'} onClick={() => setLanguage('ar')}>عربي</button>
          </div>
          <a aria-label={t.whatsapp} href={whatsappUrl ?? '#request'} target={whatsappUrl ? '_blank' : undefined} rel={whatsappUrl ? 'noopener noreferrer' : undefined} className="header-whatsapp"><Icon name="whatsapp" /><span>WhatsApp</span><Icon name="arrow" /></a>
          <button ref={menuButtonRef} className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? t.close : t.menu} onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
        </div>
      </div>
    </header>

    <main id="main">
      <section className="experience page-width" ref={experienceRef} aria-label={t.sceneView}>
        <div className="story-column">
          <div className="hero-copy">
            <div className="eyebrow"><span className="orange-square" />{t.eyebrow}</div>
            <div className="hero-device-label">{t.heroDevices}</div>
            <h1>{t.heroLines.map((line, index) => <span key={line} className={index === 2 ? 'hero-last-line' : ''}>{line}</span>)}</h1>
            <p className="hero-description">{t.heroDescription}</p>
            <a className="button button-orange" href="#request">{t.diagnostic}<Icon name="arrow" /></a>
            <div className="hero-note"><span className="note-line" />{t.preciseTag}</div>
            <a className="scroll-cue" href="#inside"><span className="scroll-cue-icon"><Icon name="down" /></span><span>{t.scrollLabel}<small>01 — 06</small></span></a>
          </div>

          <div className="inside-copy" id="inside">
            <div className="section-index"><span>01 /</span><span>{t.insideEyebrow}</span></div>
            <h2>{t.insideTitle}</h2>
            <p className="section-intro">{t.insideDescription}</p>
            <div className="services" aria-label={t.serviceSelectLabel}>
              {t.services.map(service => <div className={`service-item ${activeService === service.id ? 'is-active' : ''}`} key={service.id}>
                <button type="button" className="service-button" onClick={() => selectService(service.id)} aria-expanded={activeService === service.id} aria-controls={`service-${service.id}`}>
                  <span className="service-number">{service.number}</span><span>{service.title}</span><Icon name={activeService === service.id ? 'minus' : 'plus'} />
                </button>
                <div className="service-content" id={`service-${service.id}`} hidden={activeService !== service.id}>
                  <p>{service.description}</p><span className="service-detail"><span className="orange-square" />{service.detail}</span>
                </div>
              </div>)}
            </div>
          </div>
        </div>

        <div className="scene-column">
          <div className="scene-panel">
            <div className="scene-topline"><span><span className="status-dot" />{t.sceneInteractive}</span><span className="scene-reference" dir="ltr">AB—001</span></div>
            <div className="scene-viewport">
              {webGLUnavailable ? fallback : <SceneBoundary fallback={fallback}>
                <Suspense fallback={<FallbackScene title={t.loadingLabel} description={t.fallbackDescription} loading />}>
                  <DeviceScene progress={actualProgress} activeService={activeService} reducedMotion={reducedMotion} onUnavailable={handleUnavailable} language={language} />
                </Suspense>
              </SceneBoundary>}
            </div>
            <span className="scene-corner corner-tl" /><span className="scene-corner corner-tr" /><span className="scene-corner corner-bl" /><span className="scene-corner corner-br" />
            <span className="scene-axis" aria-hidden="true"><i />Y<span>X</span></span>
            <div className="hotspots" aria-label={t.serviceSelectLabel}>
              {(['screen', 'battery', 'cooling'] as ServiceId[]).map(id => {
                const service = t.services.find(item => item.id === id)!
                return <button key={id} type="button" className={`hotspot hotspot-${id} ${activeService === id ? 'is-selected' : ''}`} aria-pressed={activeService === id} onClick={() => selectService(id)}>
                  <span className="hotspot-dot"><span /></span><span className="hotspot-label"><span>{service.number}</span>{service.title.split(language === 'fr' ? ' &' : ' و')[0]}</span>
                </button>
              })}
            </div>
            <div className="scene-readout" aria-live="polite">
              <span className="readout-number">{active.number}</span><div><span className="readout-eyebrow">{t.sceneLabel}</span><strong>{active.title}</strong><p>{active.short}</p></div><span className="readout-plus" aria-hidden="true">+</span>
            </div>
          </div>
          <div className="scene-footer">
            <button type="button" aria-pressed={actualProgress < .15} onClick={() => setManualProgress(0)}>{t.assemblyLabel}</button>
            <div className="assembly-track" aria-hidden="true"><span style={{ width: `${Math.max(3, actualProgress * 100)}%` }} /></div>
            <button type="button" disabled={reducedMotion} aria-pressed={actualProgress > .85} onClick={() => setManualProgress(1)}>{t.explodedLabel}<Icon name="arrow" /></button>
          </div>
          <p className="scene-help">{t.sceneHint}</p>
        </div>
      </section>

      <section className="process-section" id="process">
        <div className="page-width">
          <div className="process-heading"><div><div className="section-index"><span>02 /</span><span>{t.processEyebrow}</span></div><h2>{t.processTitle}</h2></div><p>{t.processIntro}</p></div>
          <div className="process-steps">{t.steps.map(step => <article className="process-step" key={step.number}>
            <div className="step-top"><span className="step-number">{step.number}</span><span className="step-cross" aria-hidden="true">+</span></div><h3>{step.title}</h3><p>{step.description}</p>
          </article>)}</div>
          <div className="process-bottom"><span className="orange-square" /><span>{t.preciseTag}</span><span className="process-line" /><span aria-hidden="true" dir="ltr">{shopConfig.name} / {shopConfig.location[language]}</span></div>
        </div>
      </section>

      <section className="request-section page-width" id="request">
        <div className="request-copy"><div className="section-index"><span>03 /</span><span>{t.requestEyebrow}</span></div><h2>{t.requestTitle}</h2><p>{t.requestIntro}</p><div className="request-marker" aria-hidden="true"><span className="brand-symbol"><i /><i /><i /><i /></span><span>AB /<br />REPAIR LAB</span></div></div>
        <form className="repair-form" onSubmit={submitRequest} ref={formRef} noValidate>
          <p className="form-required">{t.fieldsRequired}<span aria-hidden="true">*</span></p>
          <div className="form-row">
            <div className="field"><label htmlFor="name">{t.name}<span>*</span></label><input id="name" name="name" autoComplete="name" value={request.name} onChange={event => setField('name', event.target.value)} placeholder={t.namePlaceholder} maxLength={80} required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />{errors.name && <span className="field-error" id="name-error">{errors.name}</span>}</div>
            <div className="field"><label htmlFor="device">{t.device}<span>*</span></label><select id="device" name="device" value={request.device} onChange={event => setField('device', event.target.value)} required aria-invalid={Boolean(errors.device)} aria-describedby={errors.device ? 'device-error' : undefined}><option value="">{t.devicePlaceholder}</option>{t.deviceOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{errors.device && <span className="field-error" id="device-error">{errors.device}</span>}</div>
          </div>
          <div className="field"><label htmlFor="model">{t.model}<span>*</span></label><input id="model" name="model" value={request.model} onChange={event => setField('model', event.target.value)} placeholder={t.modelPlaceholder} maxLength={100} required aria-invalid={Boolean(errors.model)} aria-describedby={errors.model ? 'model-error' : undefined} />{errors.model && <span className="field-error" id="model-error">{errors.model}</span>}</div>
          <div className="field"><label htmlFor="problem">{t.problem}<span>*</span></label><textarea id="problem" name="problem" value={request.problem} onChange={event => setField('problem', event.target.value)} placeholder={t.problemPlaceholder} rows={4} maxLength={1500} required aria-invalid={Boolean(errors.problem)} aria-describedby={errors.problem ? 'problem-error' : undefined} />{errors.problem && <span className="field-error" id="problem-error">{errors.problem}</span>}</div>
          {errors.whatsapp && <div className="form-error" role="alert">{errors.whatsapp}</div>}
          <button className="button button-orange form-submit" type="submit"><Icon name="whatsapp" />{t.send}<Icon name="arrow" /></button>
          <p className="form-note">{t.requestHint}</p>
        </form>
      </section>

      <section className="contact-section" id="contact">
        <div className="page-width"><div className="contact-main"><div className="contact-heading"><div className="section-index"><span>04 /</span><span>{t.contactEyebrow}</span></div><h2>{t.contactTitle}</h2><a href={whatsappUrl ?? '#request'} target={whatsappUrl ? '_blank' : undefined} rel={whatsappUrl ? 'noopener noreferrer' : undefined} className="contact-action">{t.whatsapp}<Icon name="arrow" /></a></div>
          <div className="contact-details"><div><span>{t.addressLabel}</span><p>{shopConfig.address}</p></div><div><span>{t.hoursLabel}</span><p>{shopConfig.hours}</p></div><div><span>{t.phoneLabel}</span><p>{numberIsConfigured ? <a href={`tel:${shopConfig.phone.replace(/[^+\d]/g, '')}`}>{shopConfig.phone}</a> : shopConfig.phone}</p></div><div><span>{t.whatsappLabel}</span><p>{shopConfig.whatsappNumber}</p></div><p className="contact-note">{t.contactNote}</p></div>
        </div>
          <div className="footer-wordmark" aria-hidden="true">{shopConfig.name}<span>.</span></div>
          <footer className="footer"><span>{shopConfig.name} © {new Date().getFullYear()}</span><span>{t.footerTag}</span><a href="#">{t.backTop}<Icon name="up" /></a></footer>
        </div>
      </section>
    </main>
  </>
}
