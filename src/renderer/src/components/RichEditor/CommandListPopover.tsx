import { useTheme } from '@renderer/context/ThemeProvider'
import type { SuggestionProps } from '@tiptap/suggestion'
import { List, Typography } from 'antd'
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

import type { Command } from './command'

const { Text } = Typography

export interface CommandListPopoverProps extends SuggestionProps<Command> {
  ref?: React.RefObject<CommandListPopoverRef | null>
}

export interface CommandListPopoverRef extends SuggestionProps<Command> {
  updateSelectedIndex: (index: number) => void
  selectCurrent: () => void
  onKeyDown: (event: KeyboardEvent) => boolean
}

const CommandListPopover = ({
  ref,
  ...props
}: SuggestionProps<Command> & { ref?: React.RefObject<CommandListPopoverRef | null> }) => {
  const { items, command } = props
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  // Reset selected index when items change
  useEffect(() => {
    setInternalSelectedIndex(0)
  }, [items])

  const selectItem = useCallback(
    (index: number) => {
      const item = props.items[index]

      if (item) {
        command({ id: item.id, label: item.title })
      }
    },
    [props.items, command]
  )

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): boolean => {
      if (!items.length) return false

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          setInternalSelectedIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1))
          return true

        case 'ArrowDown':
          event.preventDefault()
          setInternalSelectedIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1))
          return true

        case 'Enter':
          event.preventDefault()
          if (items[internalSelectedIndex]) {
            selectItem(internalSelectedIndex)
          }
          return true

        case 'Escape':
          event.preventDefault()
          return true

        default:
          return false
      }
    },
    [items, internalSelectedIndex, selectItem]
  )

  // Expose methods via ref
  useImperativeHandle(
    ref,
    () => ({
      ...props,
      updateSelectedIndex: (index: number) => setInternalSelectedIndex(index),
      selectCurrent: () => selectItem(internalSelectedIndex),
      onKeyDown: handleKeyDown
    }),
    [handleKeyDown, props, internalSelectedIndex, selectItem]
  )

  // List data source with proper typing
  const dataSource = useMemo(
    () =>
      items.map((item, index) => ({
        ...item,
        key: item.id,
        index
      })),
    [items]
  )

  // Handle mouse enter for hover effect
  const handleItemMouseEnter = useCallback((index: number) => {
    setInternalSelectedIndex(index)
  }, [])

  // Get theme from context
  const { theme } = useTheme()

  // Get background and selected colors that work with both light and dark themes
  const colors = useMemo(() => {
    const isDark = theme === 'dark'
    return {
      background: isDark ? 'var(--color-background-soft, #222222)' : 'white',
      border: isDark ? 'var(--color-border, #ffffff19)' : '#e1e5e9',
      selectedBackground: isDark ? 'var(--color-hover, rgba(40, 40, 40, 1))' : '#f0f0f0',
      boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
    }
  }, [theme])

  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 1000,
    background: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    boxShadow: colors.boxShadow,
    maxHeight: '300px',
    minWidth: '200px',
    overflow: 'hidden'
  }

  return (
    <div ref={listRef} style={style}>
      <List
        size="small"
        dataSource={dataSource}
        renderItem={(item, index) => (
          <List.Item
            key={item.id}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              backgroundColor: index === internalSelectedIndex ? colors.selectedBackground : 'transparent',
              border: 'none',
              transition: 'background-color 0.2s ease'
            }}
            onClick={() => selectItem(index)}
            onMouseEnter={() => handleItemMouseEnter(index)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <span style={{ fontSize: '16px', width: '20px', flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text strong style={{ fontSize: '14px', display: 'block' }}>
                  {item.title}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {item.description}
                </Text>
              </div>
            </div>
          </List.Item>
        )}
      />
      {items.length === 0 && (
        <div style={{ padding: '8px', color: '#999', textAlign: 'center' }}>No commands found</div>
      )}
    </div>
  )
}

CommandListPopover.displayName = 'CommandListPopover'

export default CommandListPopover
