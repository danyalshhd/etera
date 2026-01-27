* include .env file at root level with the following params:
API_KEY=PZIW8UETGPX137MP
BASE_URL=https://www.alphavantage.co

* to run npm start

check the post route in postman by
POST
http://localhost:3000/api/bookings/uuid
with following body
{
  symbol: "ABC"
}

* to run test
npm run test


# Run Postgres container with etera_db database pre-created
docker run --name etera-postgres -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=etera_db -p 5432:5432 -d postgres:15