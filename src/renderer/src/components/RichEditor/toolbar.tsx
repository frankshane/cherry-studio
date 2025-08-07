import { Tooltip } from 'antd'
import { Link2Off } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getCommandsByGroup } from './command'
import { ImageUploader } from './components/ImageUploader'
import MathInputDialog from './components/MathInputDialog'
import { ToolbarButton, ToolbarDivider, ToolbarWrapper } from './styles'
import type { FormattingCommand, FormattingState, ToolbarProps } from './types'

interface ToolbarItemInternal {
  id: string
  command?: FormattingCommand
  icon?: React.ComponentType
  type?: 'divider'
  handler?: () => void
}

// Group ordering for toolbar layout
const TOOLBAR_GROUP_ORDER = ['formatting', 'text', 'blocks', 'structure', 'media', 'history']

function getToolbarItems(): ToolbarItemInternal[] {
  const items: ToolbarItemInternal[] = []

  TOOLBAR_GROUP_ORDER.forEach((groupName, groupIndex) => {
    const groupCommands = getCommandsByGroup(groupName)

    if (groupCommands.length > 0 && groupIndex > 0) {
      items.push({ id: `divider-${groupIndex}`, type: 'divider' })
    }

    groupCommands.forEach((cmd) => {
      items.push({
        id: cmd.id,
        command: cmd.formattingCommand as FormattingCommand,
        icon: cmd.id === 'unlink' ? Link2Off : cmd.icon, // Special case for unlink icon
        handler: () => cmd.handler
      })
    })
  })

  return items
}

// Function to get tooltip text for toolbar commands
const getTooltipText = (t: any, command: FormattingCommand): string => {
  const tooltipMap: Record<FormattingCommand, string> = {
    bold: t('richEditor.toolbar.bold'),
    italic: t('richEditor.toolbar.italic'),
    underline: t('richEditor.toolbar.underline'),
    strike: t('richEditor.toolbar.strike'),
    code: t('richEditor.toolbar.code'),
    clearMarks: t('richEditor.toolbar.clearMarks'),
    paragraph: t('richEditor.toolbar.paragraph'),
    heading1: t('richEditor.toolbar.heading1'),
    heading2: t('richEditor.toolbar.heading2'),
    heading3: t('richEditor.toolbar.heading3'),
    heading4: t('richEditor.toolbar.heading4'),
    heading5: t('richEditor.toolbar.heading5'),
    heading6: t('richEditor.toolbar.heading6'),
    bulletList: t('richEditor.toolbar.bulletList'),
    orderedList: t('richEditor.toolbar.orderedList'),
    codeBlock: t('richEditor.toolbar.codeBlock'),
    blockquote: t('richEditor.toolbar.blockquote'),
    link: t('richEditor.toolbar.link'),
    unlink: t('richEditor.toolbar.unlink'),
    undo: t('richEditor.toolbar.undo'),
    redo: t('richEditor.toolbar.redo'),
    table: t('richEditor.toolbar.table'),
    image: t('richEditor.toolbar.image'),
    math: t('richEditor.toolbar.math')
  }

  return tooltipMap[command] || command
}

export const Toolbar: React.FC<ToolbarProps> = ({ editor, formattingState, onCommand }) => {
  const { t } = useTranslation()
  const [showImageUploader, setShowImageUploader] = useState(false)
  const [showMathInput, setShowMathInput] = useState(false)
  const [placeholderCallbacks, setPlaceholderCallbacks] = useState<{
    onMathSubmit?: (latex: string) => void
    onMathCancel?: () => void
    onMathFormulaChange?: (formula: string) => void
    mathDefaultValue?: string
    onImageSelect?: (imageUrl: string) => void
    onImageCancel?: () => void
  }>({})

  // Listen for custom events from placeholder nodes
  useEffect(() => {
    const handleMathDialog = (event: CustomEvent) => {
      const { defaultValue, onSubmit, onFormulaChange } = event.detail
      setPlaceholderCallbacks((prev) => ({
        ...prev,
        onMathSubmit: onSubmit,
        onMathCancel: () => {},
        onMathFormulaChange: onFormulaChange,
        mathDefaultValue: defaultValue
      }))
      setShowMathInput(true)
    }

    const handleImageUploader = (event: CustomEvent) => {
      const { onImageSelect, onCancel } = event.detail
      setPlaceholderCallbacks((prev) => ({ ...prev, onImageSelect, onImageCancel: onCancel }))
      setShowImageUploader(true)
    }

    window.addEventListener('openMathDialog', handleMathDialog as EventListener)
    window.addEventListener('openImageUploader', handleImageUploader as EventListener)

    return () => {
      window.removeEventListener('openMathDialog', handleMathDialog as EventListener)
      window.removeEventListener('openImageUploader', handleImageUploader as EventListener)
    }
  }, [])

  if (!editor) {
    return null
  }

  const handleCommand = (command: FormattingCommand) => {
    if (command === 'image') {
      // Insert image placeholder that will emit event when clicked
      editor.chain().focus().insertImagePlaceholder().run()
    } else if (command === 'math') {
      // Insert math placeholder that will emit event when clicked
      editor.chain().focus().insertMathPlaceholder().run()
    } else {
      onCommand(command)
    }
  }

  const handleImageSelect = (imageUrl: string) => {
    // Insert image into editor
    if (editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
    }
    setShowImageUploader(false)
  }

  // Get dynamic toolbar items
  const toolbarItems = getToolbarItems()

  return (
    <ToolbarWrapper data-testid="rich-editor-toolbar">
      {toolbarItems.map((item) => {
        if (item.type === 'divider') {
          return <ToolbarDivider key={item.id} />
        }

        const Icon = item.icon
        const command = item.command

        if (!Icon || !command) {
          return null
        }

        const isActive = getFormattingState(formattingState, command)
        const isDisabled = getDisabledState(formattingState, command)
        const tooltipText = getTooltipText(t, command)

        const buttonElement = (
          <ToolbarButton
            $active={isActive}
            data-active={isActive}
            disabled={isDisabled}
            onClick={() => handleCommand(command)}
            data-testid={`toolbar-${command}`}>
            <Icon />
          </ToolbarButton>
        )

        return (
          <Tooltip key={item.id} title={tooltipText} placement="top">
            {buttonElement}
          </Tooltip>
        )
      })}
      <ImageUploader
        visible={showImageUploader}
        onImageSelect={(imageUrl) => {
          // Handle both toolbar button and placeholder clicks
          if (placeholderCallbacks.onImageSelect) {
            placeholderCallbacks.onImageSelect(imageUrl)
            setPlaceholderCallbacks((prev) => ({ ...prev, onImageSelect: undefined, onImageCancel: undefined }))
          } else {
            handleImageSelect(imageUrl)
          }
          setShowImageUploader(false)
        }}
        onClose={() => {
          // Handle both toolbar button and placeholder clicks
          if (placeholderCallbacks.onImageCancel) {
            placeholderCallbacks.onImageCancel()
            setPlaceholderCallbacks((prev) => ({ ...prev, onImageSelect: undefined, onImageCancel: undefined }))
          }
          setShowImageUploader(false)
        }}
      />
      <MathInputDialog
        visible={showMathInput}
        defaultValue={placeholderCallbacks.mathDefaultValue || ''}
        onSubmit={(formula) => {
          // Handle both toolbar button and enhanced math clicks
          if (placeholderCallbacks.onMathSubmit) {
            placeholderCallbacks.onMathSubmit(formula)
            setPlaceholderCallbacks((prev) => ({
              ...prev,
              onMathSubmit: undefined,
              onMathCancel: undefined,
              onMathFormulaChange: undefined,
              mathDefaultValue: undefined
            }))
          } else {
            if (editor) {
              editor.chain().focus().insertBlockMath({ latex: formula }).run()
            }
          }
          setShowMathInput(false)
        }}
        onCancel={() => {
          // Handle both toolbar button and enhanced math clicks
          if (placeholderCallbacks.onMathCancel) {
            placeholderCallbacks.onMathCancel()
            setPlaceholderCallbacks((prev) => ({
              ...prev,
              onMathSubmit: undefined,
              onMathCancel: undefined,
              onMathFormulaChange: undefined,
              mathDefaultValue: undefined
            }))
          }
          setShowMathInput(false)
        }}
        onFormulaChange={(formula) => {
          // Handle real-time updates
          if (placeholderCallbacks.onMathFormulaChange) {
            placeholderCallbacks.onMathFormulaChange(formula)
          } else {
            // This is from toolbar button - update any existing math node
            if (editor) {
              const mathNodeType = editor.schema.nodes.math || editor.schema.nodes.mathBlock
              if (mathNodeType) {
                editor.chain().updateBlockMath({ latex: formula }).run()
              }
            }
          }
        }}
      />
    </ToolbarWrapper>
  )
}

function getFormattingState(state: FormattingState, command: FormattingCommand): boolean {
  switch (command) {
    case 'bold':
      return state?.isBold || false
    case 'italic':
      return state?.isItalic || false
    case 'underline':
      return state?.isUnderline || false
    case 'strike':
      return state?.isStrike || false
    case 'code':
      return state?.isCode || false
    case 'paragraph':
      return state?.isParagraph || false
    case 'heading1':
      return state?.isHeading1 || false
    case 'heading2':
      return state?.isHeading2 || false
    case 'heading3':
      return state?.isHeading3 || false
    case 'heading4':
      return state?.isHeading4 || false
    case 'heading5':
      return state?.isHeading5 || false
    case 'heading6':
      return state?.isHeading6 || false
    case 'bulletList':
      return state?.isBulletList || false
    case 'orderedList':
      return state?.isOrderedList || false
    case 'codeBlock':
      return state?.isCodeBlock || false
    case 'blockquote':
      return state?.isBlockquote || false
    case 'link':
      return state?.isLink || false
    case 'table':
      return state?.isTable || false
    case 'math':
      return state?.isMath || false
    default:
      return false
  }
}

function getDisabledState(state: FormattingState, command: FormattingCommand): boolean {
  switch (command) {
    case 'bold':
      return !state?.canBold
    case 'italic':
      return !state?.canItalic
    case 'underline':
      return !state?.canUnderline
    case 'strike':
      return !state?.canStrike
    case 'code':
      return !state?.canCode
    case 'undo':
      return !state?.canUndo
    case 'redo':
      return !state?.canRedo
    case 'clearMarks':
      return !state?.canClearMarks
    case 'link':
      return !state?.canLink
    case 'unlink':
      return !state?.canUnlink
    case 'table':
      return !state?.canTable
    case 'image':
      return !state?.canImage
    case 'math':
      return !state?.canMath
    default:
      return false
  }
}
