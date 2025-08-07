import styled from 'styled-components'

export const RichEditorWrapper = styled.div<{
  $minHeight?: number
  $maxHeight?: number
}>`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  overflow: hidden;

  ${({ $minHeight }) => $minHeight && `min-height: ${$minHeight}px;`}
  ${({ $maxHeight }) => $maxHeight && `max-height: ${$maxHeight}px;`}
`

export const ToolbarWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
`

export const ToolbarButton = styled.button<{
  $active?: boolean
  $disabled?: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: ${({ $active }) => ($active ? 'var(--color-primary)' : 'transparent')};
  color: ${({ $active, $disabled }) =>
    $disabled ? 'var(--color-text-3)' : $active ? 'var(--color-white)' : 'var(--color-text)'};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ $active }) => ($active ? 'var(--color-primary)' : 'var(--color-hover)')};
  }

  &:disabled {
    opacity: 0.5;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

export const ToolbarDivider = styled.div`
  width: 1px;
  height: 20px;
  background: var(--color-border);
  margin: 0 4px;
`

export const EditorContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  .drag-handle {
    align-items: center;
    background: var(--color-background-soft);
    border-radius: 0.25rem;
    border: 1px solid var(--color-border);
    cursor: grab;
    display: flex;
    height: 1.5rem;
    justify-content: center;
    width: 1.5rem;

    &:hover {
      background: var(--color-hover);
    }

    svg {
      width: 1.25rem;
      height: 1.25rem;
      color: var(--color-icon);
    }
  }
`
