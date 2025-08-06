import DragHandle from '@tiptap/extension-drag-handle-react'
import { EditorContent } from '@tiptap/react'
import React, { useEffect, useImperativeHandle } from 'react'

import { MdiDragHandle } from '../Icons/SVGIcon'
import { EditorContent as StyledEditorContent, RichEditorWrapper } from './styles'
import { Toolbar } from './toolbar'
import type { FormattingCommand, RichEditorProps, RichEditorRef } from './types'
import { useRichEditor } from './useRichEditor'

const RichEditor = ({
  ref,
  initialContent = '',
  placeholder = '',
  onContentChange,
  onHtmlChange,
  onMarkdownChange,
  editable = true,
  className = '',
  showToolbar = true,
  minHeight,
  maxHeight
  // toolbarItems: _toolbarItems // TODO: Implement custom toolbar items
}: RichEditorProps & { ref?: React.RefObject<RichEditorRef | null> }) => {
  // Use the rich editor hook for complete editor management
  const { editor, markdown, html, formattingState, setMarkdown, setHtml, clear, getPreviewText } = useRichEditor({
    initialContent,
    onChange: onMarkdownChange,
    onHtmlChange,
    onContentChange,
    placeholder,
    editable,
    disabled: !editable
  })

  // Update editor content when markdown changes externally
  useEffect(() => {
    if (editor && html && html !== editor.getHTML()) {
      editor.commands.setContent(html)
    }
  }, [editor, html])

  const handleCommand = (command: FormattingCommand) => {
    if (!editor) return

    switch (command) {
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
        break
      case 'underline':
        editor.chain().focus().toggleUnderline().run()
        break
      case 'strike':
        editor.chain().focus().toggleStrike().run()
        break
      case 'code':
        editor.chain().focus().toggleCode().run()
        break
      case 'clearMarks':
        editor.chain().focus().unsetAllMarks().run()
        break
      case 'paragraph':
        editor.chain().focus().setParagraph().run()
        break
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run()
        break
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run()
        break
      case 'heading3':
        editor.chain().focus().toggleHeading({ level: 3 }).run()
        break
      case 'heading4':
        editor.chain().focus().toggleHeading({ level: 4 }).run()
        break
      case 'heading5':
        editor.chain().focus().toggleHeading({ level: 5 }).run()
        break
      case 'heading6':
        editor.chain().focus().toggleHeading({ level: 6 }).run()
        break
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run()
        break
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run()
        break
      case 'codeBlock':
        editor.chain().focus().toggleCodeBlock().run()
        break
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run()
        break
      case 'undo':
        editor.chain().focus().undo().run()
        break
      case 'redo':
        editor.chain().focus().redo().run()
        break
    }
  }

  // Expose editor methods via ref
  useImperativeHandle(
    ref,
    () => ({
      getContent: () => editor?.getText() || '',
      getHtml: () => html,
      getMarkdown: () => markdown,
      setContent: (content: string) => {
        editor?.commands.setContent(content)
      },
      setHtml: (htmlContent: string) => {
        setHtml(htmlContent)
      },
      setMarkdown: (markdownContent: string) => {
        setMarkdown(markdownContent)
      },
      focus: () => {
        editor?.commands.focus()
      },
      clear: () => {
        clear()
        editor?.commands.clearContent()
      },
      insertText: (text: string) => {
        editor?.commands.insertContent(text)
      },
      executeCommand: (command: string, value?: any) => {
        if (editor?.commands && command in editor.commands) {
          editor.commands[command](value)
        }
      },
      getPreviewText: (maxLength?: number) => {
        return getPreviewText(markdown, maxLength)
      }
    }),
    [editor, html, markdown, setHtml, setMarkdown, clear, getPreviewText]
  )

  return (
    <RichEditorWrapper className={`rich-editor-wrapper ${className}`} $minHeight={minHeight} $maxHeight={maxHeight}>
      {showToolbar && <Toolbar editor={editor} formattingState={formattingState} onCommand={handleCommand} />}
      <StyledEditorContent>
        <DragHandle editor={editor}>
          <MdiDragHandle />
        </DragHandle>
        <EditorContent editor={editor} />
      </StyledEditorContent>
    </RichEditorWrapper>
  )
}

RichEditor.displayName = 'RichEditor'

export default RichEditor
