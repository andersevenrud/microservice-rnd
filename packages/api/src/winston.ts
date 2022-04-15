import winston from 'winston'
import Transport from 'winston-transport'
import { Producer, CompressionTypes } from 'kafkajs'

class KafkaTransport extends Transport {
  private readonly producer: Producer

  constructor(producer: Producer) {
    super()
    this.producer = producer
  }

  async log(info: any, callback: (error?: Error) => void) {
    try {
      const { level, message, ...meta } = info

      await this.producer.send({
        topic: 'logs',
        compression: CompressionTypes.GZIP,
        messages: [
          {
            value: JSON.stringify({ level, message, meta }),
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
