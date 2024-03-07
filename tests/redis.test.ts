import { createClient } from 'redis'
import { GenericContainer, type StartedTestContainer } from 'testcontainers'

describe('Redis from docker hub', () => {
  let container: StartedTestContainer
  let redisClient

  beforeAll(async () => {
    container = await new GenericContainer('redis')
      .withExposedPorts(6379)
      .start()

    redisClient = await createClient(
      {
        url: `redis://${container.getHost()}:${container.getMappedPort(6379)}`
      }
    )
      .connect()
  }, 50_000)

  afterAll(async () => {
    await redisClient.quit()
    await container.stop()
  })

  it('works', async () => {
    await redisClient.set('key', 'val')
    expect(await redisClient.get('key')).toBe('val')
  })
})
