import React, { ReactElement } from 'react'
import { compile } from 'html-to-text'
import {
  render,
  Mjml,
  MjmlHead,
  MjmlTitle,
  MjmlPreview,
  MjmlBody,
  MjmlSection,
  MjmlColumn,
  MjmlButton,
  MjmlImage,
} from 'mjml-react'
import config from './config'

export interface MessageContext {
  html: string
  text?: string
  subject: string
}

const convertToText = compile({
  wordwrap: 120,
})

function renderMessage(subject: string, node: ReactElement) {
  const { html, errors } = render(node, { validationLevel: 'soft' })
  const text = convertToText(html)

  if (errors.length) {
    throw errors[0]
  }

  return { html, subject, text }
}

export const createWelcomeMessage = () =>
  renderMessage(
    'Welcome',
    <Mjml>
      <MjmlHead>
        <MjmlTitle>Welcome</MjmlTitle>
        <MjmlPreview>Welcome to the service...</MjmlPreview>
      </MjmlHead>
      <MjmlBody width={500}>
        <MjmlSection fullWidth backgroundColor="#efefef">
          <MjmlColumn>
            <MjmlImage src="https://images.unsplash.com/photo-1610692507254-3bc16d2527ea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1931&q=80" />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection>
          <MjmlColumn>
            <MjmlButton
              padding="20px"
              backgroundColor="#346DB7"
              href={config.appUrl}
            >
              View my instance
            </MjmlButton>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  )
