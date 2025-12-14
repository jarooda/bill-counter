import { useIMask } from 'vue-imask'
import type { Ref } from 'vue'

export interface CurrencyMaskOptions {
  onAccept?: (value: string, unmaskedValue: string, typedValue: number) => void
  onComplete?: (value: string, unmaskedValue: string, typedValue: number) => void
  defaultValue?: string
}

export const useCurrencyMask = (options?: CurrencyMaskOptions) => {
  const maskOptions = {
    mask: Number,
    scale: 0,
    thousandsSeparator: '.',
    radix: ',',
    mapToRadix: ['.'],
    min: 0,
    max: 999999999999,
    normalizeZeros: true,
    padFractionalZeros: false,
  }

  const { el, masked, unmasked, typed } = useIMask(maskOptions, {
    onAccept: () => {
      if (options?.onAccept) {
        options.onAccept(masked.value, unmasked.value, typed.value)
      }
    },
    onComplete: () => {
      if (options?.onComplete) {
        options.onComplete(masked.value, unmasked.value, typed.value)
      }
    },
    defaultValue: options?.defaultValue,
  })

  return {
    el: el as Ref<HTMLInputElement | null>,
    masked,
    unmasked,
    typed,
  }
}
