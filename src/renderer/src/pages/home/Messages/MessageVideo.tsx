import { loggerService } from '@renderer/services/LoggerService'
import { VideoMessageBlock } from '@renderer/types/newMessage'
import { FC } from 'react'
import YouTube, { YouTubeProps } from 'react-youtube'
import styled from 'styled-components'

const logger = loggerService.withContext('MessageVideo')
interface Props {
  block: VideoMessageBlock
}

const MessageVideo: FC<Props> = ({ block }) => {
  logger.debug(`MessageVideo: ${JSON.stringify(block)}`)

  if (!block.url) {
    return null
  }

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    event.target.pauseVideo()
  }

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      start: Math.floor(block.metadata?.startTime)
    }
  }

  return (
    <Container>
      {block.metadata?.type === 'youtube' && (
        <YouTube style={{ height: '100%', width: '100%' }} videoId={block.url} opts={opts} onReady={onPlayerReady} />
      )}
    </Container>
  )
}

export default MessageVideo

const Container = styled.div`
  max-width: 560px;
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
`
