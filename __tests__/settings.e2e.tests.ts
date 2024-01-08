import request from 'supertest'
import { app } from '../src/settings'
import dotenv from 'dotenv'
dotenv.config()
import {VideoType} from "../src/settings";

describe('/videos', () => {
    let newVideo: VideoType | null = null

    beforeAll(async () => {
        await client.connect()
        await request(app).delete('/testing/all-data').expect(204)
    })

    afterAll(async () => {
        await client.close()
    })

    it('GET products = []', async () => {
        await request(app).get('/videos/').expect([])
    })

})