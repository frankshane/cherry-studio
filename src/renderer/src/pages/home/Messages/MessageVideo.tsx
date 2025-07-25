import { loggerService } from '@renderer/services/LoggerService'
import { VideoMessageBlock } from '@renderer/types/newMessage'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import styled from 'styled-components'

const logger = loggerService.withContext('MessageVideo')
interface Props {
  block: VideoMessageBlock
}

const MessageVideo: FC<Props> = ({ block }) => {
  const { t } = useTranslation()

  logger.debug(`MessageVideo: ${JSON.stringify(block)}`)

  if (!block.url) {
    return null
  }

  return (
    <Container>
      {block.metadata?.type === 'youtube' && (
        <LiteYouTubeEmbed
          id={block.url}
          title={block.metadata?.title ?? 'YouTube video player'}
          params={`start=${Math.floor(block.metadata?.startTime)}`}
          playerClass=""
          style={{
            height: '100%',
            width: '100%'
          }}
        />
      )}
    </Container>
  )
}

export default MessageVideo

const Container = styled.div`
  max-width: 560px; /* 视频的标准宽度 */
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;

  .lty-playbtn {
    display: none;
  }
`
