import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    google?: any
  }
}

type Props = { onCredential: (idToken: string) => void }

export default function GoogleButton({ onCredential }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = 'google-gis'
    const exists = document.getElementById(id)
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
    if (!clientId) return

    const init = () => {
      if (!window.google) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp: { credential?: string }) => {
          if (resp?.credential) onCredential(resp.credential)
        }
      })
      if (ref.current) {
        window.google.accounts.id.renderButton(ref.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text: 'continue_with',
          logo_alignment: 'left'
        })
      }
    }

    if (!exists) {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      s.defer = true
      s.id = id
      s.onload = init
      document.head.appendChild(s)
    } else {
      init()
    }
  }, [onCredential])

  return <div ref={ref} />
}
