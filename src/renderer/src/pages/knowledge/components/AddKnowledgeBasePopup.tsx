import { loggerService } from '@logger'
import AiProvider from '@renderer/aiCore'
import { TopView } from '@renderer/components/TopView'
import { useKnowledgeBases } from '@renderer/hooks/useKnowledge'
import { useKnowledgeBaseForm } from '@renderer/hooks/useKnowledgeBaseForm'
import { getProviderByModel } from '@renderer/services/AssistantService'
import { getKnowledgeBaseParams } from '@renderer/services/KnowledgeService'
import { KnowledgeBase, Model, Provider } from '@renderer/types'
import { formatErrorMessage, getErrorMessage } from '@renderer/utils/error'
import { Button } from 'antd'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  AdvancedSettingsPanel,
  GeneralSettingsPanel,
  KnowledgeBaseFormModal,
  type PanelConfig
} from './KnowledgeSettings'

const logger = loggerService.withContext('AddKnowledgeBasePopup')

interface ShowParams {
  title: string
}

interface PopupContainerProps extends ShowParams {
  resolve: (data: any) => void
}

const PopupContainer: React.FC<PopupContainerProps> = ({ title, resolve }) => {
  const [open, setOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()
  const { addKnowledgeBase } = useKnowledgeBases()
  const {
    newBase,
    setNewBase,
    handlers,
    providerData: { selectedDocPreprocessProvider, docPreprocessSelectOptions }
  } = useKnowledgeBaseForm()

  const fetchDimension = useCallback(
    async (provider: Provider, model: Model) => {
      setLoading(true)
      try {
        const aiProvider = new AiProvider(provider)
        return await aiProvider.getEmbeddingDimensions(model)
        // for controlled input
        // if (ref?.current) {
        //   ref.current.value = dimension.toString()
        // }
        // onChange?.(dimension)
      } catch (error) {
        logger.error(t('knowledge.error.get_embedding_dimensions'), error as Error)
        throw new Error(t('knowledge.error.get_embedding_dimensions') + '\n' + getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    },
    [t]
  )

  const onOk = async () => {
    if (!newBase.name?.trim()) {
      window.message.error(t('knowledge.name_required'))
      return
    }

    if (!newBase.model) {
      window.message.error(t('knowledge.embedding_model_required'))
      return
    }

    // auto dims
    if (!newBase.userDims || newBase.dimensions === -1) {
      try {
        window.message.loading({ content: t('knowledge.dimensions_getting'), key: 'dimensions-getting' })
        const dimensions = await fetchDimension(getProviderByModel(newBase.model), newBase.model)
        window.message.destroy('dimensions-getting')
        newBase.dimensions = dimensions
      } catch (e) {
        window.message.error(t('knowledge.error.failed_to_create') + formatErrorMessage(e))
      }
    }

    try {
      const _newBase: KnowledgeBase = {
        ...newBase,
        created_at: Date.now(),
        updated_at: Date.now(),
        framework: 'langchain'
      }

      await window.api.knowledgeBase.create(getKnowledgeBaseParams(_newBase))

      addKnowledgeBase(_newBase)
      setOpen(false)
      resolve(_newBase)
    } catch (error) {
      logger.error('KnowledgeBase creation failed:', error as Error)
      window.message.error(t('knowledge.error.failed_to_create') + formatErrorMessage(error))
    }
  }

  const onCancel = () => {
    setOpen(false)
    resolve(null)
  }

  const panelConfigs: PanelConfig[] = [
    {
      key: 'general',
      label: t('settings.general.label'),
      panel: (
        <GeneralSettingsPanel
          newBase={newBase}
          setNewBase={setNewBase}
          selectedDocPreprocessProvider={selectedDocPreprocessProvider}
          docPreprocessSelectOptions={docPreprocessSelectOptions}
          handlers={handlers}
        />
      )
    },
    {
      key: 'advanced',
      label: t('settings.advanced.title'),
      panel: <AdvancedSettingsPanel newBase={newBase} handlers={handlers} />
    }
  ]

  return (
    <KnowledgeBaseFormModal
      title={title}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      panels={panelConfigs}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t('common.cancel')}
        </Button>,
        <Button type="primary" key="submit" onClick={onOk} loading={loading}>
          {t('common.add')}
        </Button>
      ]}
    />
  )
}

export default class AddKnowledgeBasePopup {
  static TopViewKey = 'AddKnowledgeBasePopup'

  static hide() {
    TopView.hide(this.TopViewKey)
  }

  static show(props: ShowParams) {
    return new Promise<any>((resolve) => {
      TopView.show(
        <PopupContainer
          {...props}
          resolve={(v) => {
            resolve(v)
            this.hide()
          }}
        />,
        this.TopViewKey
      )
    })
  }
}
