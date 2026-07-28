import type { EscritorApi } from '../shared/types'

declare global {
  interface Window {
    escritor: EscritorApi
  }
}

export {}
