import { Bold, Italic, List, ListOrdered, Type, Underline } from 'lucide-react'
import React from 'react'

import { ToolbarButton, ToolbarDivider, ToolbarWrapper } from './styles'
import type { FormattingCommand, ToolbarProps } from './types'

interface ToolbarItemInternal {
  id: string
  command?: FormattingCommand
  icon?: React.ComponentType
  type?: 'divider'
}

const DEFAULT_TOOLBAR_ITEMS: ToolbarItemInternal[] = [
  { id: 'bold', command: 'bold' as FormattingCommand, icon: Bold },
  { id: 'italic', command: 'italic' as FormattingCommand, icon: Italic },
  { id: 'underline', command: 'underline' as FormattingCommand, icon: Underline },
  { id: 'divider-1', type: 'divider' },
  { id: 'heading', command: 'heading' as FormattingCommand, icon: Type },
  { id: 'divider-2', type: 'divider' },
  { id: 'bulletList', command: 'bulletList' as FormattingCommand, icon: List },
  { id: 'orderedList', command: 'orderedList' as FormattingCommand, icon: ListOrdered }
]

export const Toolbar: React.FC<ToolbarProps> = ({ editor, formattingState, onCommand }) => {
  if (!editor) {
    return null
  }

  const handleCommand = (command: FormattingCommand) => {
    onCommand(command)
  }

  return (
    <ToolbarWrapper data-testid="rich-editor-toolbar">
      {DEFAULT_TOOLBAR_ITEMS.map((item) => {
        if (item.type === 'divider') {
          return <ToolbarDivider key={item.id} />
        }

        const Icon = item.icon
        const command = item.command

        if (!Icon || !command) {
          return null
        }

        const isActive = getFormattingState(formattingState, command)

        return (
          <ToolbarButton
            key={item.id}
            $active={isActive}
            data-active={isActive}
            onClick={() => handleCommand(command)}
            title={command}
            data-testid={`toolbar-${command}`}>
            <Icon />
          </ToolbarButton>
        )
      })}
    </ToolbarWrapper>
  )
}

function getFormattingState(state: any, command: FormattingCommand): boolean {
  switch (command) {
    case 'bold':
      return state?.bold || false
    case 'italic':
      return state?.italic || false
    case 'underline':
      return state?.underline || false
    case 'heading':
      return state?.headingLevel > 0 || false
    case 'bulletList':
      return state?.bulletList || false
    case 'orderedList':
      return state?.orderedList || false
    default:
      return false
  }
}
