import * as nodemailer from 'nodemailer-mock'
import { sendMail } from './sendmail'

describe('sendmail', () => {
  it('should send mail', async () => {
    const transporter = nodemailer.createTransport({})
    const result = await sendMail(
      transporter,
      {
        template: 'welcome',
        to: 'user@localhost',
      },
      {
        from: 'jest@localhost',
        appUrl: 'http://jest',
      }
    )

    expect(result).toBe(undefined)
  })
})
