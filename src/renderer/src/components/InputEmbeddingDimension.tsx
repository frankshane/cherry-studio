import { loggerService } from '@logger'
import { useProvider } from '@renderer/hooks/useProvider'
import { Model } from '@renderer/types'
import { InputNumber, Space } from 'antd'
import { memo, useMemo } from 'react'

const logger = loggerService.withContext('DimensionsInput')

interface InputEmbeddingDimensionProps {
  value?: number | null
  onChange?: (value: number | null) => void
  model?: Model
  disabled?: boolean
  style?: React.CSSProperties
}

const InputEmbeddingDimension = ({
  ref,
  value,
  onChange,
  model,
  disabled: _disabled,
  style
}: InputEmbeddingDimensionProps & { ref?: React.RefObject<HTMLInputElement> | null }) => {
  const { provider } = useProvider(model?.provider ?? '')

  const disabled = useMemo(() => _disabled || !model || !provider, [_disabled, model, provider])

  disabled && logger.debug("I'm disabled because", { _disabled, model, provider })

  return (
    <Space.Compact style={{ width: '100%', ...style }}>
      <InputNumber
        ref={ref}
        min={1}
        style={{ flex: 1 }}
        placeholder="1024"
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </Space.Compact>
  )
}

export default memo(InputEmbeddingDimension)
