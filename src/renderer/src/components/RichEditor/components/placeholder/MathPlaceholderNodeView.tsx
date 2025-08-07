import { Editor } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import { Calculator } from 'lucide-react'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import PlaceholderBlock from './PlaceholderBlock'

interface MathPlaceholderNodeViewProps {
  node: any
  updateAttributes: (attributes: Record<string, any>) => void
  deleteNode: () => void
  editor: Editor
}

const MathPlaceholderNodeView: React.FC<MathPlaceholderNodeViewProps> = ({ deleteNode, editor }) => {
  const { t } = useTranslation()

  const handleClick = useCallback(() => {
    const event = new CustomEvent('openMathDialog', {
      detail: {
        defaultValue: '',
        onSubmit: (latex: string) => {
          if (latex.trim()) {
            deleteNode()
            editor.chain().focus().insertBlockMath({ latex }).run()
          } else {
            deleteNode()
          }
        },
        onCancel: () => deleteNode()
      }
    })
    window.dispatchEvent(event)
  }, [editor, deleteNode])

  return (
    <NodeViewWrapper className="math-placeholder-wrapper">
      <PlaceholderBlock
        icon={<Calculator size={20} style={{ color: '#656d76' }} />}
        message={t('richEditor.math.placeholder')}
        onClick={handleClick}
      />
    </NodeViewWrapper>
  )
}

export default MathPlaceholderNodeView
