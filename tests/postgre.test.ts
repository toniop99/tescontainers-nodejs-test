import { GenericContainer, type StartedTestContainer, Wait } from 'testcontainers'
import { Client } from 'pg'
import path from 'node:path'

jest.setTimeout(50_000)

describe('PostgresSQL from Dockerfile', () => {
  let container: StartedTestContainer
  let client: Client

  beforeAll(async () => {
    const buildContainer = await GenericContainer
      .fromDockerfile(path.join(__dirname, '/../Docker/postgrelsql'))
      .build()

    container = await buildContainer
      .withEnvironment({
        POSTGRES_USER: 'sample',
        POSTGRES_PASSWORD: 'sample',
        POSTGRES_DB: 'sample_db'
      })
      .withExposedPorts(5432)
      .withWaitStrategy(Wait.forLogMessage(/.*database system is ready to accept connections.*/, 2)
      )
      .start()

    client = new Client({
      user: 'sample',
      password: 'sample',
      database: 'sample_db',
      host: container.getHost(),
      port: container.getMappedPort(5432)
    })

    await client.connect()
  })

  afterAll(async () => {
    await client.end()
    await container.stop()
  })

  it('Test insert in postgresql', async () => {
    await client.query("INSERT INTO books (name, price) VALUES ('book_A', 100), ('book_B', 200);")
    const result = await client.query('SELECT * from books')

    expect(result.rows[0].price + result.rows[1].price).toBe(300)
  })
})
