import { loggerService } from '@logger'
import { CodeHeader } from '@renderer/components/CodeBlockView/view'
import CodeEditor from '@renderer/components/CodeEditor'
import { CodeTool, CodeToolbar } from '@renderer/components/CodeToolbar'
import { mergeAttributes, Node, textblockTypeInputRule } from '@tiptap/core'
import { NodeViewContent, type NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { Languages } from 'lucide-react'
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

const logger = loggerService.withContext('RichEditor:CodeBlock')

/**
 * React NodeView component for CodeBlock
 * Integrates CodeEditor component with tiptap editor
 */
const CodeBlockComponent: React.FC<NodeViewProps> = memo(({ node, getPos, editor, updateAttributes }) => {
  const { language } = node.attrs
  const content = node.textContent || ''
  const [tools, setTools] = useState<CodeTool[]>([])

  const renderHeader = useMemo(() => {
    const langTag = '<' + language.toUpperCase() + '>'
    return <CodeHeader>{langTag}</CodeHeader>
  }, [language])

  const handleSave = useCallback(
    (newContent: string) => {
      try {
        const pos = getPos()
        if (pos !== undefined && editor) {
          // Update only the text content, not the entire node
          const start = pos + 1 // Start of content (after opening tag)
          const end = pos + node.nodeSize - 1 // End of content (before closing tag)

          const transaction = editor.state.tr.replaceWith(start, end, newContent ? editor.schema.text(newContent) : [])
          editor.view.dispatch(transaction)

          logger.info('Code content saved', {
            language,
            newContent: newContent.substring(0, 50) + '...'
          })
        }
      } catch (error) {
        logger.error('Error saving code content:', error as Error)
      }
    },
    [editor, getPos, language, node]
  )

  const handleLanguageSelect = useCallback(() => {
    const newLanguage = window.prompt('Enter language (e.g., javascript, python, typescript):', language)
    if (newLanguage && newLanguage !== language) {
      updateAttributes({ language: newLanguage })
    }
  }, [language, updateAttributes])

  // Add language selector tool
  useEffect(() => {
    const languageTool: CodeTool = {
      id: 'language',
      type: 'quick',
      order: 0,
      icon: <Languages className="icon" />,
      tooltip: `Language: ${language}`,
      onClick: handleLanguageSelect,
      visible: () => true
    }

    setTools((prev) => {
      const hasLanguageTool = prev.some((tool) => tool.id === 'language')
      if (!hasLanguageTool) {
        return [languageTool, ...prev]
      }
      return prev.map((tool) => (tool.id === 'language' ? languageTool : tool))
    })
  }, [language, handleLanguageSelect])

  return (
    <StyledNodeViewWrapper className="code-block-node" data-drag-handle>
      {renderHeader}
      <CodeToolbar tools={tools} />
      <CodeEditor
        value={content}
        language={language}
        onSave={handleSave}
        setTools={setTools}
        editable={true}
        height="auto"
        minHeight="120px"
        options={{
          collapsible: false,
          wrappable: true
        }}
      />
      {/* Hidden content div to make the node focusable and editable */}
      <NodeViewContent as="div" style={{ display: 'none' }} />
    </StyledNodeViewWrapper>
  )
})

CodeBlockComponent.displayName = 'CodeBlockComponent'

const StyledNodeViewWrapper = styled(NodeViewWrapper)`
  position: relative;

  /* Ensure proper focus behavior */
  &:focus-within {
    outline: none;
  }

  /* Hide tiptap placeholder when CodeEditor is focused */
  &:focus-within ~ .placeholder,
  &:focus-within + .placeholder {
    display: none !important;
    visibility: hidden !important;
  }
`

/**
 * TipTap CodeBlock Node extension
 * Uses CodeEditor component for rich code editing experience
 */
export const CodeBlockNode = Node.create({
  name: 'codeBlock',

  group: 'block',

  content: 'text*',

  marks: '',

  code: true,

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      defaultLanguage: 'text'
    }
  },

  addAttributes() {
    return {
      language: {
        default: this.options.defaultLanguage,
        parseHTML: (element) => {
          const classNames = [...(element.firstElementChild?.classList || [])]
          const languages = classNames
            .filter((className) => className.startsWith('language-'))
            .map((className) => className.replace('language-', ''))
          const language = languages[0]

          if (!language) {
            return this.options.defaultLanguage
          }

          return language
        },
        rendered: false
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full'
      }
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'pre',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      [
        'code',
        {
          class: node.attrs.language ? `language-${node.attrs.language}` : null
        },
        0
      ]
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent, {
      contentDOMElementTag: 'code',
      as: 'pre'
    })
  },

  addCommands() {
    return {
      setCodeBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes)
        },
      toggleCodeBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes)
        }
    }
  },

  addInputRules() {
    return [
      // Rule for ```language format (e.g., ```javascript, ```python, ```c++, ```TypeScript)
      textblockTypeInputRule({
        find: /^```([a-zA-Z0-9+#-]*)\s$/,
        type: this.type,
        getAttributes: (match) => {
          const language = match[1]?.toLowerCase() || this.options.defaultLanguage
          return { language }
        }
      }),
      // Rule for plain ``` format (defaults to text)
      textblockTypeInputRule({
        find: /^```\s$/,
        type: this.type,
        getAttributes: () => {
          return { language: this.options.defaultLanguage }
        }
      })
    ]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),
      // Exit code block with triple Enter
      'Enter Enter Enter': ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection

        if ($from.parent.type.name === this.name) {
          return editor.commands.splitListItem('listItem')
        }

        return false
      },
      // Prevent backspace from deleting the entire code block
      Backspace: ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection

        // If we're in a code block, prevent default behavior to let CodeEditor handle it
        if ($from.parent.type.name === this.name) {
          // Only delete the entire node if it's completely empty AND cursor is at the beginning
          const nodeText = $from.parent.textContent
          const isEmptyText = !nodeText || nodeText.trim() === ''
          const isAtBeginning = $from.parentOffset === 0

          logger.debug('CodeBlock backspace handling', {
            nodeText: nodeText?.substring(0, 20) + '...',
            isEmptyText,
            isAtBeginning,
            parentOffset: $from.parentOffset
          })

          if (isEmptyText && isAtBeginning) {
            logger.info('Deleting empty code block')
            return editor.commands.deleteNode(this.name)
          }

          // For all other cases in a code block, prevent TipTap from handling backspace
          // This allows the CodeEditor (CodeMirror) to handle the keystroke properly
          logger.debug('Preventing TipTap backspace, letting CodeEditor handle it')
          return true
        }

        return false
      },
      // Prevent delete from deleting the entire code block
      Delete: ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection

        // If we're in a code block, prevent TipTap from handling delete
        if ($from.parent.type.name === this.name) {
          // Let CodeEditor (CodeMirror) handle the delete key
          return true
        }

        return false
      }
    }
  }
})

export default CodeBlockNode
