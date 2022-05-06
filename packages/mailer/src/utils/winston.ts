import winston from 'winston'
import Transport from 'winston-transport'
import { Producer, CompressionTypes } from 'kafkajs'

class KafkaTransport extends Transport {
  private readonly name: string
  private readonly producer: Producer

  constructor(name: string, producer: Producer) {
    super()
    this.name = name
    this.producer = producer
  }

  async log(info: any, callback: (error?: Error) => void) {
    const { level, message, ...meta } = info

    this.producer
      .send({
        topic: 'logs',
        compression: CompressionTypes.GZIP,
        messages: [
          {
            value: JSON.stringify({ level, message, meta }),
            headers: {
              service: this.name,
            },
          },
        ],
      })
      .catch((e) => console.error('Error sending log to Kafka', e))

    callback()
  }
}

export const createWinston = (name: string, producer: Producer) =>
  winston.createLogger({
    transports: [
      new winston.transports.Console({}),
      new KafkaTransport(name, producer),
    ],
  })
