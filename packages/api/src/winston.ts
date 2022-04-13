import winston from 'winston'
import Transport from 'winston-transport'
import { Producer } from 'kafkajs'

class KafkaTransport extends Transport {
  private readonly producer: Producer

  constructor(producer: Producer) {
    super()
    this.producer = producer
  }

  async log(info: any, callback: (error?: Error) => void) {
    try {
      await this.producer.send({
        topic: 'logs',
        messages: [
          {
            value: JSON.stringify(info),
            headers: {
              service: 'api',
            },
          },
        ],
      })
    } catch (e) {
      console.error(e)
    } finally {
      callback()
    }
  }
}

export const createWinston = (producer: Producer) =>
  winston.createLogger({
    transports: [
      new winston.transports.Console({}),
      new KafkaTransport(producer),
    ],
  })
