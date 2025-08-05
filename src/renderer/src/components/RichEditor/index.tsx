import { Underline } from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import React, { useEffect, useImperativeHandle, useMemo, useState } from 'react'

import { EditorContent as StyledEditorContent, RichEditorWrapper } from './styles'
import { Toolbar } from './toolbar'
import type { FormattingCommand, FormattingState, RichEditorProps, RichEditorRef } from './types'

const RichEditor = ({
  ref,
  initialContent = '',
  placeholder = '',
  onContentChange,
  onHtmlChange,
  editable = true,
  className = '',
  showToolbar = true,
  minHeight,
  maxHeight
  // toolbarItems: _toolbarItems // TODO: Implement custom toolbar items
}: RichEditorProps & { ref?: React.RefObject<RichEditorRef | null> }) => {
  const [formattingState, setFormattingState] = useState<FormattingState>({
    bold: false,
    italic: false,
    underline: false,
    headingLevel: 0,
    bulletList: false,
    orderedList: false
  })

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Underline
    ],
    []
  )

  const editor = useEditor({
    extensions,
    content: initialContent,
    editable,
    editorProps: {
      attributes: {
        'data-placeholder': placeholder
      }
    },
    onUpdate: ({ editor }) => {
      const content = editor.getText()
      const html = editor.getHTML()

      onContentChange?.(content)
      onHtmlChange?.(html)

      // Update formatting state
      setFormattingState({
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        underline: editor.isActive('underline'),
        headingLevel: getHeadingLevel(editor),
        bulletList: editor.isActive('bulletList'),
        orderedList: editor.isActive('orderedList')
      })
    },
    onSelectionUpdate: ({ editor }) => {
      // Update formatting state when selection changes
      setFormattingState({
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        underline: editor.isActive('underline'),
        headingLevel: getHeadingLevel(editor),
        bulletList: editor.isActive('bulletList'),
        orderedList: editor.isActive('orderedList')
      })
    }
  })

  // Helper function to get heading level
  const getHeadingLevel = (editor: any): number => {
    for (let level = 1; level <= 6; level++) {
      if (editor.isActive('heading', { level })) {
        return level
      }
    }
    return 0
  }

  // Update formatting state when editor becomes available
  useEffect(() => {
    if (editor) {
      setFormattingState({
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        underline: editor.isActive('underline'),
        headingLevel: getHeadingLevel(editor),
        bulletList: editor.isActive('bulletList'),
        orderedList: editor.isActive('orderedList')
      })
    }
  }, [editor])

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
      case 'heading':
        // Toggle between paragraph and heading level 2
        if (editor.isActive('heading')) {
          editor.chain().focus().setParagraph().run()
        } else {
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        break
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run()
        break
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run()
        break
      case 'paragraph':
        editor.chain().focus().setParagraph().run()
        break
    }
  }

  // Expose editor methods via ref
  useImperativeHandle(
    ref,
    () => ({
      getContent: () => editor?.getText() || '',
      getHtml: () => editor?.getHTML() || '',
      setContent: (content: string) => {
        editor?.commands.setContent(content)
      },
      setHtml: (html: string) => {
        editor?.commands.setContent(html)
      },
      focus: () => {
        editor?.commands.focus()
      },
      clear: () => {
        editor?.commands.clearContent()
      },
      insertText: (text: string) => {
        editor?.commands.insertContent(text)
      },
      executeCommand: (command: string, value?: any) => {
        if (editor?.commands && command in editor.commands) {
          editor.commands[command](value)
        }
      }
    }),
    [editor]
  )

  return (
    <RichEditorWrapper className={`rich-editor-wrapper ${className}`} $minHeight={minHeight} $maxHeight={maxHeight}>
      {showToolbar && <Toolbar editor={editor} formattingState={formattingState} onCommand={handleCommand} />}
      <StyledEditorContent>
        <EditorContent editor={editor} />
      </StyledEditorContent>
    </RichEditorWrapper>
  )
}

RichEditor.displayName = 'RichEditor'

export default RichEditor
