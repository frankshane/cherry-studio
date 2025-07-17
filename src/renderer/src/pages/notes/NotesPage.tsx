import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { FC } from 'react'
import styled from 'styled-components'

const NotesPage: FC = () => {
  return (
    <Container id="notes-page">
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none', gap: 10 }}>笔记</NavbarCenter>
      </Navbar>
      <ContentContainer>
        <h1>笔记页面</h1>
        <p>这里是笔记功能的内容区域。</p>
      </ContentContainer>
    </Container>
  )
}

const Container = styled.div`
  flex: 1;
`

const ContentContainer = styled.div`
  height: calc(100vh - var(--navbar-height));
  display: flex;
  flex-direction: column;
  padding: 20px;
`

export default NotesPage
