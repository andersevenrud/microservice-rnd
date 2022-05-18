import React from 'react'
import { Mjml, MjmlBody, MjmlColumn, MjmlSection, MjmlText } from 'mjml-react'
import { renderMessage } from './messages'

describe('messages', () => {
  it('should render mail', async () => {
    const node = (
      <Mjml>
        <MjmlBody>
          <MjmlSection>
            <MjmlColumn>
              <MjmlText>Hello world</MjmlText>
            </MjmlColumn>
          </MjmlSection>
        </MjmlBody>
      </Mjml>
    )

    const { html, subject, text } = renderMessage('subject', node)
    expect(subject).toEqual('subject')
    expect(text).toEqual('Hello world')
    expect(html.includes('Hello world')).toEqual(true)
  })
})
