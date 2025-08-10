import InfoTooltip from '@renderer/components/InfoTooltip'
import InputEmbeddingDimension from '@renderer/components/InputEmbeddingDimension'
import ModelSelector from '@renderer/components/ModelSelector'
import { DEFAULT_KNOWLEDGE_DOCUMENT_COUNT } from '@renderer/config/constant'
import { isEmbeddingModel, isRerankModel } from '@renderer/config/models'
import { useProviders } from '@renderer/hooks/useProvider'
import { getModelUniqId } from '@renderer/services/ModelService'
import { KnowledgeBase, PreprocessProvider } from '@renderer/types'
import { Flex, Input, Segmented, Select, SelectProps, Slider, Switch } from 'antd'
import { useTranslation } from 'react-i18next'

import { SettingsItem, SettingsPanel } from './styles'

interface GeneralSettingsPanelProps {
  newBase: KnowledgeBase
  setNewBase: React.Dispatch<React.SetStateAction<KnowledgeBase>>
  selectedDocPreprocessProvider?: PreprocessProvider
  docPreprocessSelectOptions: SelectProps['options']
  handlers: {
    handleEmbeddingModelChange: (value: string) => void
    handleDimensionChange: (value: number | null) => void
    handleRerankModelChange: (value: string) => void
    handleDocPreprocessChange: (value: string) => void
  }
}

const GeneralSettingsPanel: React.FC<GeneralSettingsPanelProps> = ({
  newBase,
  setNewBase,
  selectedDocPreprocessProvider,
  docPreprocessSelectOptions,
  handlers
}) => {
  const { t } = useTranslation()
  const { providers } = useProviders()
  const { handleEmbeddingModelChange, handleDimensionChange, handleRerankModelChange, handleDocPreprocessChange } =
    handlers

  return (
    <SettingsPanel>
      <SettingsItem>
        <div className="settings-label">{t('common.name')}</div>
        <Input
          placeholder={t('common.name')}
          value={newBase.name}
          onChange={(e) => setNewBase((prev) => ({ ...prev, name: e.target.value }))}
        />
      </SettingsItem>

      <SettingsItem>
        <div className="settings-label">
          {t('models.embedding_model')}
          <InfoTooltip title={t('models.embedding_model_tooltip')} placement="right" />
        </div>
        <ModelSelector
          providers={providers}
          predicate={isEmbeddingModel}
          style={{ width: '100%' }}
          placeholder={t('settings.models.empty')}
          value={getModelUniqId(newBase.model)}
          onChange={handleEmbeddingModelChange}
        />
      </SettingsItem>

      <SettingsItem>
        <Flex justify="space-between">
          <div className="settings-label">
            {t('knowledge.dimensions_auto_set')}
            <InfoTooltip title={t('knowledge.dimensions_default')} placement="right" />
          </div>
          <Switch
            checked={!newBase.userDims}
            onChange={(checked: boolean) => setNewBase((prev) => ({ ...prev, userDims: !checked }))}
          />
        </Flex>
      </SettingsItem>

      {newBase.userDims && (
        <SettingsItem>
          <div className="settings-label">
            {t('knowledge.dimensions')}
            <InfoTooltip title={t('knowledge.dimensions_size_tooltip')} placement="right" />
          </div>
          <InputEmbeddingDimension
            value={newBase.dimensions}
            onChange={handleDimensionChange}
            model={newBase.model}
            disabled={!newBase.model}
          />
        </SettingsItem>
      )}

      <SettingsItem>
        <div className="settings-label">
          {t('models.rerank_model')}
          <InfoTooltip title={t('models.rerank_model_tooltip')} placement="right" />
        </div>
        <ModelSelector
          providers={providers}
          predicate={isRerankModel}
          style={{ width: '100%' }}
          value={getModelUniqId(newBase.rerankModel) || undefined}
          placeholder={t('settings.models.empty')}
          onChange={handleRerankModelChange}
          allowClear
        />
      </SettingsItem>

      {newBase.framework !== 'embedjs' && (
        <SettingsItem>
          <div className="settings-label">
            {t('knowledge.retriever')}
            <InfoTooltip title={t('knowledge.retriever_tooltip')} placement="right" />
          </div>
          <Segmented
            style={{ width: '100%' }}
            value={newBase.retriever || 'hybrid'}
            onChange={(value) => setNewBase({ ...newBase, retriever: value as 'vector' | 'bm25' | 'hybrid' })}
            options={[
              { label: t('knowledge.retriever_hybrid'), value: 'hybrid' },
              { label: t('knowledge.retriever_vector'), value: 'vector' },
              { label: t('knowledge.retriever_bm25'), value: 'bm25' }
            ]}
          />
          {newBase.retriever === 'hybrid' && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-3)' }}>
              {t('knowledge.retriever_hybrid_desc')}
            </div>
          )}
          {newBase.retriever === 'vector' && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-3)' }}>
              {t('knowledge.retriever_vector_desc')}
            </div>
          )}
          {newBase.retriever === 'bm25' && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-3)' }}>
              {t('knowledge.retriever_bm25_desc')}
            </div>
          )}
        </SettingsItem>
      )}

      <SettingsItem>
        <div className="settings-label">
          {t('settings.tool.preprocess.title')}
          <InfoTooltip title={t('settings.tool.preprocess.tooltip')} placement="right" />
        </div>
        <Select
          value={selectedDocPreprocessProvider?.id}
          style={{ width: '100%' }}
          onChange={handleDocPreprocessChange}
          placeholder={t('settings.tool.preprocess.provider_placeholder')}
          options={docPreprocessSelectOptions}
          allowClear
        />
      </SettingsItem>

      <SettingsItem>
        <div className="settings-label">
          {t('knowledge.document_count')}
          <InfoTooltip title={t('knowledge.document_count_help')} placement="right" />
        </div>
        <Slider
          style={{ width: '100%' }}
          min={1}
          max={50}
          step={1}
          value={newBase.documentCount || DEFAULT_KNOWLEDGE_DOCUMENT_COUNT}
          marks={{ 1: '1', 6: t('knowledge.document_count_default'), 30: '30', 50: '50' }}
          onChange={(value) => setNewBase((prev) => ({ ...prev, documentCount: value }))}
        />
      </SettingsItem>
    </SettingsPanel>
  )
}

export default GeneralSettingsPanel
