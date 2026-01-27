import request from "supertest";
import { app } from '../../app';

jest.mock('../../external/mockVendor', () => ({
    mockVendorApi: jest.fn(() => ({ 
        success: true, 
        reference: 'VENDOR-TEST-123' 
    }))
}));

it('returns an error if invalid request is provided', async () => {
    await request(app)
        .post('/api/bookings')
        .send({
            userId: '',
            amount: -10
        })
        .expect(400)
})

it('returns 201 if valid booking request is provided', async () => {
    await request(app)
        .post('/api/bookings')
        .set('Idempotency-Key', 'test-key-1')
        .send({
            userId: 'user123',
            amount: 99.99
        })
        .expect(201)
})

it('returns 200 if booking already exists (idempotent)', async () => {
    const idempotencyKey = 'test-key-2';
    
    await request(app)
        .post('/api/bookings')
        .set('Idempotency-Key', idempotencyKey)
        .send({
            userId: 'user456',
            amount: 50.00
        })
        .expect(201)

    await request(app)
        .post('/api/bookings')
        .set('Idempotency-Key', idempotencyKey)
        .send({
            userId: 'user456',
            amount: 50.00
        })
        .expect(200)
})

it('returns 404 if booking not found', async () => {
    await request(app)
        .get('/api/bookings/550e8400-e29b-41d4-a716-446655440000')
        .expect(404)
})
