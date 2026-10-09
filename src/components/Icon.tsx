type IconName = 'arrow' | 'down' | 'up' | 'whatsapp' | 'pin' | 'plus' | 'minus' | 'check' | 'menu' | 'close'

export default function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 19 19 5M5 5h14v14" /></>,
    down: <><path d="M12 4v16M5 13l7 7 7-7" /></>,
    up: <><path d="M12 20V4M5 11l7-7 7 7" /></>,
    whatsapp: <><path d="M20.4 11.5a8.4 8.4 0 0 1-12.5 7.3L3 20l1.3-4.7A8.4 8.4 0 1 1 20.4 11.5Z" /><path d="M8 7.5c-.6.5-.8 1.6-.2 2.8 1 2.1 2.6 3.8 4.8 4.6 1.3.5 2.3.1 2.8-.6l.3-1.1-2.4-1.2-.8 1c-1.4-.5-2.6-1.6-3.2-3l.8-.8L9 7.1 8 7.5Z" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    check: <path d="m5 12 4 4L19 6" />,
    menu: <><path d="M4 8h16M4 16h16" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  }
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
