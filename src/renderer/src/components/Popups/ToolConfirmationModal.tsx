import { ExclamationCircleOutlined, SafetyCertificateOutlined, ToolOutlined } from '@ant-design/icons'
import { TopView } from '@renderer/components/TopView'
import { MCPTool } from '@renderer/types'
import { confirmServerAction, ToolConfirmationResult } from '@renderer/utils/userConfirmation'
import { Button, Card, Tag, Typography } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const { Text, Title } = Typography

interface ToolConfirmationModalProps {
  serverId: string
  serverName: string
  tools: MCPTool[]
  toolIds: string[]
}

const ToolConfirmationModal: React.FC<ToolConfirmationModalProps> = ({ serverId, serverName, tools, toolIds }) => {
  const { t } = useTranslation()
  const isMultipleTools = tools.length > 1

  const handleConfirm = (result: ToolConfirmationResult) => {
    confirmServerAction(serverId, result)
    TopView.hide(`server-confirmation-${serverId}`)
  }

  return (
    <OverlayContainer>
      <ModalCard>
        <ModalHeader>
          <ExclamationCircleOutlined
            style={{
              fontSize: '24px',
              color: 'var(--color-warning)',
              marginRight: '12px'
            }}
          />
          <Title level={4} style={{ margin: 0 }}>
            {isMultipleTools
              ? t('message.tools.batchConfirmTitle', {
                  serverName,
                  count: tools.length
                })
              : t('message.tools.confirmTitle', {
                  serverName
                })}
          </Title>
        </ModalHeader>

        <ToolsSection>
          <SectionTitle>
            <ToolOutlined style={{ marginRight: '8px', color: 'var(--color-primary)' }} />
            <Text strong>
              {isMultipleTools
                ? t('message.tools.toolsToExecute', { count: tools.length })
                : t('message.tools.toolToExecute')}
            </Text>
          </SectionTitle>
          <ToolsList>
            {tools.map((tool, index) => (
              <ToolItem key={toolIds[index] || index}>
                <ToolInfo>
                  <ToolName>{tool.name}</ToolName>
                  {tool.description && <ToolDescription>{tool.description}</ToolDescription>}
                </ToolInfo>
                <ServerTag>{tool.serverName}</ServerTag>
              </ToolItem>
            ))}
          </ToolsList>
        </ToolsSection>

        <WarningText>
          <Text type="secondary">
            {isMultipleTools
              ? t('message.tools.batchWarning', {
                  count: tools.length,
                  serverName
                })
              : t('message.tools.warning')}
          </Text>
        </WarningText>

        <ButtonContainer>
          <LeftButtons>
            <Button size="large" onClick={() => handleConfirm('allow_once')} style={{ minWidth: '120px' }}>
              {isMultipleTools ? t('message.tools.allowOnceAll') : t('message.tools.allowOnce')}
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<SafetyCertificateOutlined />}
              onClick={() => handleConfirm('approved')}
              style={{
                minWidth: '120px',
                backgroundColor: 'var(--color-primary)',
                borderColor: 'var(--color-primary)'
              }}>
              {isMultipleTools ? t('message.tools.allowAll') : t('message.tools.allow')}
            </Button>
          </LeftButtons>

          <Button danger size="large" onClick={() => handleConfirm('denied')} style={{ minWidth: '120px' }}>
            {isMultipleTools ? t('message.tools.denyAll') : t('message.tools.deny')}
          </Button>
        </ButtonContainer>
      </ModalCard>
    </OverlayContainer>
  )
}

// 样式组件
const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalCard = styled(Card)`
  width: 520px;
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: none;
  overflow: hidden;

  .ant-card-body {
    padding: 32px;
    overflow-y: auto;
    max-height: calc(80vh - 64px);
  }
`

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
`

const ToolsSection = styled.div`
  margin-bottom: 20px;
`

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--color-bg-1);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
`

const ToolsList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 8px;
`

const ToolItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--color-bg-2);
  }
`

const ToolInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const ToolName = styled.div`
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 4px;
`

const ToolDescription = styled.div`
  font-size: 12px;
  color: var(--color-text-2);
  line-height: 1.4;
  margin-top: 4px;
`

const ServerTag = styled(Tag)`
  margin-left: 12px;
  flex-shrink: 0;
`

const WarningText = styled.div`
  margin-bottom: 32px;
  padding: 16px;
  background: var(--color-warning-bg);
  border: 1px solid var(--color-warning-border);
  border-radius: 8px;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const LeftButtons = styled.div`
  display: flex;
  gap: 12px;
`

// 辅助函数

/**
 * 显示工具确认弹窗（统一接口）
 */
export const showToolConfirmation = (toolId: string, tool: MCPTool) => {
  // 兼容性：单工具确认转换为服务器确认
  const serverId = tool.serverId || `legacy_${toolId}`
  showServerConfirmation(serverId, tool.serverName, [tool], [toolId])
}

/**
 * 显示服务器批量工具确认弹窗
 */
export const showServerConfirmation = (serverId: string, serverName: string, tools: MCPTool[], toolIds: string[]) => {
  const modalElement = (
    <ToolConfirmationModal serverId={serverId} serverName={serverName} tools={tools} toolIds={toolIds} />
  )

  TopView.show(modalElement, `server-confirmation-${serverId}`)
}

export default ToolConfirmationModal
