import { LoadingOutlined } from '@ant-design/icons'
import { loggerService } from '@logger'
import RichEditor from '@renderer/components/RichEditor'
import { RichEditorRef } from '@renderer/components/RichEditor/types'
import { useDefaultModel } from '@renderer/hooks/useAssistant'
import { useSettings } from '@renderer/hooks/useSettings'
import { fetchTranslate } from '@renderer/services/ApiService'
import { getDefaultTranslateAssistant } from '@renderer/services/AssistantService'
import { getLanguageByLangcode } from '@renderer/utils/translate'
import { Modal, ModalProps } from 'antd'
import { Languages } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TopView } from '../TopView'

const logger = loggerService.withContext('RichEditPopup')

interface ShowParams {
  content: string
  modalProps?: ModalProps
  showTranslate?: boolean
  disableCommands?: string[] // 要禁用的命令列表
  children?: (props: { onOk?: () => void; onCancel?: () => void }) => React.ReactNode
}

interface Props extends ShowParams {
  resolve: (data: any) => void
}

const PopupContainer: React.FC<Props> = ({
  content,
  modalProps,
  resolve,
  children,
  showTranslate = true,
  disableCommands = ['image'] // 默认禁用 image 命令
}) => {
  const [open, setOpen] = useState(true)
  const { t } = useTranslation()
  const [richContent, setRichContent] = useState(content)
  const [isTranslating, setIsTranslating] = useState(false)
  const editorRef = useRef<RichEditorRef>(null)
  const { translateModel } = useDefaultModel()
  const { targetLanguage, showTranslateConfirm } = useSettings()
  const isMounted = useRef(true)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  const onOk = () => {
    const finalContent = editorRef.current?.getMarkdown() || richContent
    resolve(finalContent)
    setOpen(false)
  }

  const onCancel = () => {
    resolve(null)
    setOpen(false)
  }

  const onClose = () => {
    resolve(null)
  }

  const handleAfterOpenChange = (visible: boolean) => {
    if (visible && editorRef.current) {
      // Focus the editor after modal opens
      setTimeout(() => {
        editorRef.current?.focus()
      }, 100)
    }
  }

  const handleTranslate = async () => {
    // 翻译时使用纯文本内容
    const currentContent = editorRef.current?.getContent() || richContent
    if (!currentContent.trim() || isTranslating) return

    if (showTranslateConfirm) {
      const confirmed = await window?.modal?.confirm({
        title: t('translate.confirm.title'),
        content: t('translate.confirm.content'),
        centered: true
      })
      if (!confirmed) return
    }

    if (!translateModel) {
      window.message.error({
        content: t('translate.error.not_configured'),
        key: 'translate-message'
      })
      return
    }

    if (isMounted.current) {
      setIsTranslating(true)
    }

    try {
      const assistant = getDefaultTranslateAssistant(getLanguageByLangcode(targetLanguage), currentContent)
      const translatedText = await fetchTranslate({ content: currentContent, assistant })
      if (isMounted.current && editorRef.current) {
        editorRef.current.setContent(translatedText)
        setRichContent(translatedText)
      }
    } catch (error) {
      logger.error('Translation failed:', error as Error)
      window.message.error({
        content: t('translate.error.failed'),
        key: 'translate-message'
      })
    } finally {
      if (isMounted.current) {
        setIsTranslating(false)
      }
    }
  }

  const handleContentChange = (newContent: string) => {
    setRichContent(newContent)
  }

  const handleMarkdownChange = (newMarkdown: string) => {
    // 更新Markdown内容状态
    setRichContent(newMarkdown)
  }

  // 处理命令配置
  const handleCommandsReady = (commandAPI: Pick<RichEditorRef, 'unregisterToolbarCommand' | 'unregisterCommand'>) => {
    // 禁用指定的命令
    if (disableCommands?.length) {
      disableCommands.forEach((commandId) => {
        commandAPI.unregisterCommand(commandId)
      })
    }
  }

  RichEditPopup.hide = onCancel

  return (
    <Modal
      title={t('common.edit')}
      width="70vw"
      style={{ maxHeight: '80vh' }}
      transitionName="animation-move-down"
      okText={t('common.save')}
      {...modalProps}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      afterClose={onClose}
      afterOpenChange={handleAfterOpenChange}
      maskClosable={false}
      centered>
      <EditorContainer>
        <RichEditor
          ref={editorRef}
          initialContent={content}
          placeholder={t('richEditor.placeholder')}
          onContentChange={handleContentChange}
          onMarkdownChange={handleMarkdownChange}
          onCommandsReady={handleCommandsReady}
          minHeight={300}
          maxHeight={500}
          className="rich-edit-popup-editor"
        />
        {showTranslate && (
          <TranslateButton
            onClick={handleTranslate}
            aria-label="Translate text"
            disabled={isTranslating || !richContent.trim()}>
            {isTranslating ? <LoadingOutlined spin /> : <Languages size={16} />}
          </TranslateButton>
        )}
      </EditorContainer>
      <ChildrenContainer>{children && children({ onOk, onCancel })}</ChildrenContainer>
    </Modal>
  )
}

const TopViewKey = 'RichEditPopup'

const ChildrenContainer = styled.div`
  position: relative;
`

const EditorContainer = styled.div`
  position: relative;

  .rich-edit-popup-editor {
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-background);

    &:focus-within {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-alpha);
    }
  }
`

const TranslateButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  padding: 6px;
  cursor: pointer;
  color: var(--color-icon);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 2px 4px var(--color-shadow);

  &:hover {
    background-color: var(--color-background-mute);
    color: var(--color-text-1);
    border-color: var(--color-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export default class RichEditPopup {
  static topviewId = 0
  static hide() {
    TopView.hide(TopViewKey)
  }
  static show(props: ShowParams) {
    return new Promise<any>((resolve) => {
      TopView.show(
        <PopupContainer
          {...props}
          resolve={(v) => {
            resolve(v)
            TopView.hide(TopViewKey)
          }}
        />,
        TopViewKey
      )
    })
  }
}
