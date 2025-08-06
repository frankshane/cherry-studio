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

  .ProseMirror {
    padding: 12px;
    outline: none;
    min-height: 120px;
    overflow-y: auto;

    &:focus {
      outline: none;
    }

    p {
      margin: 0 0 8px 0;

      &:last-child {
        margin-bottom: 0;
      }
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 16px 0 8px 0;
      font-weight: 600;

      &:first-child {
        margin-top: 0;
      }
    }

    h1 {
      font-size: 1.5em;
    }
    h2 {
      font-size: 1.3em;
    }
    h3 {
      font-size: 1.1em;
    }
    h4 {
      font-size: 1em;
    }
    h5 {
      font-size: 0.9em;
    }
    h6 {
      font-size: 0.8em;
    }

    ul,
    ol {
      margin: 8px 0;
      padding-left: 24px;
    }

    li {
      margin: 4px 0;
    }

    strong {
      font-weight: 600;
    }

    em {
      font-style: italic;
    }

    u {
      text-decoration: underline;
    }
  }
`

export const ToolbarWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-secondary);
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
    $disabled ? 'var(--color-text-disabled)' : $active ? 'var(--color-white)' : 'var(--color-text)'};
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
  overflow: hidden;
  .drag-handle {
    align-items: center;
    background: #f0f0f0;
    border-radius: 0.25rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    cursor: grab;
    display: flex;
    height: 1.5rem;
    justify-content: center;
    width: 1.5rem;

    svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
  .tiptap {
    :first-child {
      margin-top: 0;
    }
    ul,
    ol {
      padding: 0 1rem;
      margin: 1.25rem 1rem 1.25rem 0.4rem;

      li p {
        margin-top: 0.25em;
        margin-bottom: 0.25em;
      }
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      line-height: 1.1;
      margin-top: 2.5rem;
      text-wrap: pretty;
    }

    h1,
    h2 {
      margin-top: 3.5rem;
      margin-bottom: 1.5rem;
    }

    h1 {
      font-size: 1.4rem;
    }

    h2 {
      font-size: 1.2rem;
    }

    h3 {
      font-size: 1.1rem;
    }

    h4,
    h5,
    h6 {
      font-size: 1rem;
    }

    blockquote {
      border-left: 3px solid var(--color-gray-3);
      margin: 1.5rem 0;
      padding-left: 1rem;
    }

    code {
      background-color: var(--color-inline-code-background);
      border-radius: 0.4rem;
      color: var(--color-inline-code-text);
      font-size: 0.85rem;
      padding: 0.25em 0.3em;
    }

    pre {
      background: var(--color-black);
      border-radius: 0.5rem;
      color: var(--color-white);
      font-family: 'Ubuntu', monospace;
      margin: 1.5rem 0;
      padding: 0.75rem 1rem;

      code {
        background: none;
        color: inherit;
        font-size: 0.8rem;
        padding: 0;
      }
    }

    hr {
      border: none;
      border-top: 1px solid var(--color-gray-2);
      margin: 2rem 0;
    }
  }
`
