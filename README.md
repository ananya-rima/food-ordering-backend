# Food Ordering Platform - Backend

Node.js + Express + MongoDB (Mongoose). JWT access/refresh tokens, RBAC, admin secret key, ownership validation.
Structure: **MVC** with **class-based controllers**.

```
server.js
src/
  app.js
  config/        env.js, db.js
  models/        User, Category, Restaurant, Food, Cart, Order
  controllers/   AuthController, AdminController, CategoryController, RestaurantController,
                 FoodController, CartController, OrderController
  routes/        auth, admin, category, restaurant, food, cart, order (+ index)
  middlewares/   auth (authenticate, authorize), adminSecret, validate, errorHandler
  validations/   Joi schemas per module
  utils/         ApiError, ApiResponse, asyncHandler, token, pagination, regex, ownership
  seeds/         createAdmin.js
```

## Run
```
npm install
cp .env.example .env      # edit secrets + Mongo URI
npm run seed:admin        # creates the admin account (admins cannot self-register)
npm run dev
```

## Auth headers
- Protected routes: `Authorization: Bearer <accessToken>`
- Admin APIs (and admin calls to /orders, /categories): also `x-admin-secret: <ADMIN_SECRET_KEY>`

## Endpoints
| Method | Path | Role |
|---|---|---|
| POST | /api/auth/register | public (role: user / owner) |
| POST | /api/auth/login | public |
| POST | /api/auth/refresh-token | public (body: refreshToken) |
| POST | /api/auth/logout | any logged in |
| GET | /api/auth/me | any logged in |
| GET | /api/categories, /api/categories/:id | user, owner (admin + secret) |
| POST/PUT/DELETE | /api/categories(/:id) | admin + secret |
| POST | /api/restaurants | owner |
| GET/PUT | /api/restaurants/my | owner |
| PATCH | /api/restaurants/my/status | owner (open/closed) |
| GET | /api/restaurants?search=&status=&page=&limit= | user, owner |
| GET | /api/restaurants/:id | user, owner |
| POST | /api/foods | owner |
| GET | /api/foods/my | owner |
| PUT/DELETE | /api/foods/:id | owner (own restaurant only) |
| PATCH | /api/foods/:id/availability | owner |
| GET | /api/foods?search=&restaurantName=&category=&isVeg=&minPrice=&maxPrice=&sort=&page=&limit= | user, owner |
| GET | /api/cart | user |
| POST | /api/cart/items `{foodId, quantity}` | user |
| PATCH | /api/cart/items/:foodId `{action:"increase"\|"decrease"}` or `{quantity}` | user |
| DELETE | /api/cart/items/:foodId, /api/cart | user |
| POST | /api/orders `{deliveryAddress, paymentMethod, notes}` | user (from cart) |
| GET | /api/orders?status= | user: own, owner: own restaurant, admin: all |
| GET | /api/orders/:id | owner of order / restaurant owner / admin |
| PATCH | /api/orders/:id/status `{status}` | owner (own restaurant), admin |
| PATCH | /api/orders/:id/cancel | user (own, pending only) |
| GET | /api/admin/stats, /users, /restaurants, /orders | admin + secret |
| PATCH | /api/admin/users/:id/block, /unblock | admin + secret |

## Order status flow
pending -> accepted | rejected; accepted -> preparing -> out_for_delivery -> delivered.
User can cancel only while pending. Admin can additionally cancel any non-final order.
