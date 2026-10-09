import { shopConfig } from '../config'
import { content, type Language } from './content'

export interface RepairRequest {
  name: string
  device: string
  model: string
  problem: string
}

export type RequestErrors = Partial<Record<keyof RepairRequest | 'whatsapp', string>>

/** Accept an international number, including country code; reject placeholders. */
export function getWhatsAppNumber(): string | null {
  const configured: string = shopConfig.whatsappNumber.trim()
  if (!/^\+?[\d\s().-]+$/.test(configured)) return null
  const digits = configured.replace(/\D/g, '')
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null
}

export function validateRequest(request: RepairRequest, language: Language = 'fr', checkWhatsApp = true): RequestErrors {
  const messages = content[language].formErrors
  const errors: RequestErrors = {}
  const name = request.name.trim()
  const model = request.model.trim()
  const problem = request.problem.trim()
  if (name.length < 2 || name.length > 80) errors.name = messages.name
  if (!content[language].deviceOptions.some((option) => option.value === request.device)) errors.device = messages.device
  if (model.length < 2 || model.length > 100) errors.model = messages.model
  if (problem.length < 10 || problem.length > 1500) errors.problem = messages.problem
  if (checkWhatsApp && !getWhatsAppNumber()) errors.whatsapp = messages.whatsapp
  return errors
}

/** Opens a conversation draft only. The visitor sends it themselves in WhatsApp. */
export function createWhatsAppUrl(request?: RepairRequest, language: Language = 'fr'): string | null {
  const number = getWhatsAppNumber()
  if (!number) return null
  const copy = content[language]
  const greeting = language === 'ar'
    ? `مرحبًا ${shopConfig.name}، أود طلب تشخيص لجهازي.`
    : `Bonjour ${shopConfig.name}, je souhaite un diagnostic pour mon appareil.`
  const device = request
    ? copy.deviceOptions.find((option) => option.value === request.device)?.label ?? request.device.trim()
    : ''
  const message = request
    ? [
        greeting,
        '',
        `${copy.name} : ${request.name.trim()}`,
        `${copy.device} : ${device}`,
        `${copy.model} : ${request.model.trim()}`,
        `${copy.problem} : ${request.problem.trim()}`,
      ].join('\n')
    : greeting
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
