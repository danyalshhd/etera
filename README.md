# Install Project
* include .env file at root level with the following params:
`DATABASE_URL=
DATABASE_URL_TEST=
VENDOR_URL=`

* to run npm start

# Run Project

check the GET route in postman by GET


http://localhost:3000/api/bookings/{uuid}



POST

http://localhost:3000/api/bookings/

{
    "userId": "user123",
    "amount": 99.99
}


OR

`
curl --location 'http://localhost:3000/api/bookings' \
--header 'Idempotency-Key: 550e8400-e29b-41d4-a716-446655440001' \
--header 'Content-Type: application/json' \
--data '{
    "userId": "user123",
    "amount": 99.99
}'
`

# Run Test

* to run test
npm run test


# Run Postgres container with etera_db database pre-created
docker run --name etera-postgres -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=etera_db -p 5432:5432 -d postgres:15

docker exec -it etera-postgres createdb -U user etera_db_test

# Improvements:
Logging be added
ORM be utilized