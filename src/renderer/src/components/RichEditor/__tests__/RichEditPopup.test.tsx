import { describe, expect, it, vi } from 'vitest'

import RichEditPopup from '../../Popups/RichEditPopup'

// Mock dependencies
vi.mock('@logger', () => ({
  loggerService: {
    withContext: () => ({
      error: vi.fn()
    })
  }
}))

vi.mock('@renderer/hooks/useAssistant', () => ({
  useDefaultModel: () => ({
    translateModel: { id: 'test-model' }
  })
}))

vi.mock('@renderer/hooks/useSettings', () => ({
  useSettings: () => ({
    targetLanguage: 'en',
    showTranslateConfirm: false
  })
}))

vi.mock('@renderer/services/ApiService', () => ({
  fetchTranslate: vi.fn().mockResolvedValue('Translated text')
}))

vi.mock('@renderer/services/AssistantService', () => ({
  getDefaultAssistant: vi.fn().mockReturnValue({ id: 'default-assistant', name: 'Default' }),
  getDefaultTranslateAssistant: vi.fn().mockReturnValue({ id: 'assistant' })
}))

vi.mock('@renderer/utils/translate', () => ({
  getLanguageByLangcode: vi.fn().mockReturnValue('English')
}))

const mockTopView = {
  show: vi.fn(),
  hide: vi.fn()
}

vi.mock('../TopView', () => ({
  TopView: mockTopView
}))

// Mock global objects
Object.defineProperty(window, 'modal', {
  value: {
    confirm: vi.fn().mockResolvedValue(true)
  }
})

Object.defineProperty(window, 'message', {
  value: {
    error: vi.fn()
  }
})

describe('RichEditPopup', () => {
  describe('Static Methods', () => {
    it('should have show method', () => {
      expect(typeof RichEditPopup.show).toBe('function')
    })

    it('should have hide method', () => {
      expect(typeof RichEditPopup.hide).toBe('function')
    })

    it('should return a promise from show method', () => {
      const result = RichEditPopup.show({ content: 'test' })
      expect(result).toBeInstanceOf(Promise)
    })
  })

  describe('Integration', () => {
    it('should have TopView integration methods', () => {
      // Test that the popup class exists and has the expected structure
      expect(RichEditPopup.show).toBeDefined()
      expect(RichEditPopup.hide).toBeDefined()

      // The actual TopView integration happens at runtime
      // These are basic smoke tests to ensure the methods exist
    })
  })

  describe('Props Interface', () => {
    it('should accept content prop', () => {
      expect(() => RichEditPopup.show({ content: 'test' })).not.toThrow()
    })

    it('should accept modalProps', () => {
      expect(() =>
        RichEditPopup.show({
          content: 'test',
          modalProps: { title: 'Custom Title' }
        })
      ).not.toThrow()
    })

    it('should accept showTranslate prop', () => {
      expect(() =>
        RichEditPopup.show({
          content: 'test',
          showTranslate: false
        })
      ).not.toThrow()
    })
  })
})
