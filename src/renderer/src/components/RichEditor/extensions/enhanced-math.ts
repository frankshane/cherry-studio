import { Editor, mergeAttributes, Node } from '@tiptap/core'
import Math from '@tiptap/extension-mathematics'
import { ReactNodeViewRenderer } from '@tiptap/react'

import MathPlaceholderNodeView from '../components/placeholder/MathPlaceholderNodeView'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathPlaceholder: {
      insertMathPlaceholder: () => ReturnType
    }
  }
}

// Enhanced Math extension that emits events instead of using prompt
export const EnhancedMath = Math.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      blockOptions: {
        onClick: ({ node, pos, editor }: { node: any; pos: number; editor: Editor }) => {
          // Emit custom event that toolbar can listen to
          const event = new CustomEvent('openMathDialog', {
            detail: {
              defaultValue: node.attrs.latex || '',
              onSubmit: (latex: string) => {
                // Final submission - update the math node
                editor.chain().setNodeSelection(pos).updateBlockMath({ latex }).focus().run()
              },
              onFormulaChange: (formula: string) => {
                // Real-time update during input
                editor.chain().setNodeSelection(pos).updateBlockMath({ latex: formula }).run()
              }
            }
          })
          window.dispatchEvent(event)
          return true
        }
      },
      inlineOptions: {
        onClick: ({ node, pos, editor }: { node: any; pos: number; editor: Editor }) => {
          // Emit custom event for inline math too
          const event = new CustomEvent('openMathDialog', {
            detail: {
              defaultValue: node.attrs.latex || '',
              onSubmit: (latex: string) => {
                // Final submission - update the inline math node
                editor.chain().setNodeSelection(pos).updateInlineMath({ latex }).focus().run()
              },
              onFormulaChange: (formula: string) => {
                // Real-time update during input
                editor.chain().setNodeSelection(pos).updateInlineMath({ latex: formula }).run()
              }
            }
          })
          window.dispatchEvent(event)
          return true
        }
      }
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      insertMathPlaceholder:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: 'mathPlaceholder',
            attrs: {}
          })
        }
    }
  },

  addExtensions() {
    const base = (this.parent?.() as any[]) || []
    return [
      ...base,
      Node.create({
        name: 'mathPlaceholder',
        group: 'block',
        atom: true,
        draggable: true,

        addOptions() {
          return {
            HTMLAttributes: {}
          }
        },

        parseHTML() {
          return [
            {
              tag: 'div[data-type="math-placeholder"]'
            }
          ]
        },

        renderHTML({ HTMLAttributes }) {
          return [
            'div',
            mergeAttributes(HTMLAttributes, {
              'data-type': 'math-placeholder'
            }),
            'Math equation placeholder - click to edit'
          ]
        },

        addNodeView() {
          return ReactNodeViewRenderer(MathPlaceholderNodeView)
        },

        addCommands() {
          return {
            insertMathPlaceholder:
              () =>
              ({ commands }) => {
                return commands.insertContent({
                  type: this.name,
                  attrs: {}
                })
              }
          }
        }
      })
    ]
  }
})
