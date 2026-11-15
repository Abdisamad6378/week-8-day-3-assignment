# Week 8 Day 3: Testing

This project covers three kinds of automated tests, one for each layer of the testing pyramid we covered in class:

| Layer | What is tested | Tool | File |
|---|---|---|---|
| Unit | 5 small helper functions | Vitest | `utils/helpers.test.js` |
| Integration (API) | Express endpoints for products | Vitest + Supertest | `tests/products.test.js` |
| Component | A React `Greeting` form | Vitest + React Testing Library | `src/Greeting.test.jsx` |

There are 15 tests in total (5 per file), and they all pass.

## Getting started

```bash
npm install
npm run test:run        # run all tests once
npm test                # watch mode: re-runs tests when you save a file
npm run test:coverage   # run once and print a coverage report
npm start               # start the API on http://localhost:5000
```

Running `npx vitest run --reporter=verbose` lists every test by name:

```
 ✓ |node| utils/helpers.test.js > formatCurrency > formats numbers with KES prefix and commas
 ✓ |node| utils/helpers.test.js > validateEmail > returns valid for correct email, error for empty/invalid
 ✓ |node| utils/helpers.test.js > generateSlug > converts text to URL-friendly slugs
 ✓ |node| utils/helpers.test.js > calculateDiscount > calculates correct discounted price and throws for invalid input
 ✓ |node| utils/helpers.test.js > formatDate > formats ISO string to readable date
 ✓ |node| tests/products.test.js > GET /api/products > returns a list of products
 ✓ |node| tests/products.test.js > POST /api/products > creates a new product with 201 status
 ✓ |node| tests/products.test.js > GET /api/products/:id > returns a single product by ID
 ✓ |node| tests/products.test.js > POST /api/products (invalid) > returns 400 when name is missing
 ✓ |node| tests/products.test.js > DELETE /api/products/:id > deletes a product and returns 204
 ✓ |react| src/Greeting.test.jsx > Greeting component > renders correctly with heading and submit button
 ✓ |react| src/Greeting.test.jsx > Greeting component > shows greeting after submitting a name
 ✓ |react| src/Greeting.test.jsx > Greeting component > form submission updates the message
 ✓ |react| src/Greeting.test.jsx > Greeting component > shows loading state after submit
 ✓ |react| src/Greeting.test.jsx > Greeting component > shows error when name is empty

 Test Files  3 passed (3)
      Tests  15 passed (15)
```

## Project structure

```
week-8-day-3-assignment/
├── app.js                  Express app (exported, does NOT call listen)
├── server.js               Starts the app on a port
├── utils/
│   ├── helpers.js          formatCurrency, validateEmail, generateSlug, calculateDiscount, formatDate
│   └── helpers.test.js     Unit tests
├── tests/
│   └── products.test.js    Supertest API tests
├── src/
│   ├── Greeting.jsx        React form component
│   └── Greeting.test.jsx   React Testing Library tests
├── vitest.config.mjs       Two test projects: node and jsdom
└── vitest.setup.js         Loads jest-dom matchers, cleans up between tests
```

## Test setup

The API tests run in plain Node, but React components need a DOM (`document`, `window`) to render into. So `vitest.config.mjs` defines two **projects**:

- **node**: runs `utils/**/*.test.js` and `tests/**/*.test.js` with `environment: 'node'`
- **react**: runs `src/**/*.test.jsx` with `environment: 'jsdom'` (a fake browser), plus a setup file

`vitest.setup.js` imports `@testing-library/jest-dom/vitest`, which adds matchers like `toBeInTheDocument()` and `toHaveTextContent()`. After each test it also calls `cleanup()` so the next test starts with an empty page.

`@vitejs/plugin-react` lets Vitest understand JSX. `globals: true` means `describe`, `it`, `expect` and `beforeEach` work without importing them.

The config file is named `.mjs`, not `.js`. The project is CommonJS (it uses `require`), and Vite warns when a `.js` file in a CommonJS project uses `import`/`export`. The `.mjs` extension tells Node "this file is an ES module", and the warning goes away. The settings are the same as in the assignment.

## Task 1: Unit tests

Each helper gets its own `describe` block. Each block has one `it` that checks the cases from the assignment:

- **formatCurrency**: `1500` → `KES 1,500`, `1000000` → `KES 1,000,000`, `0` → `KES 0`
- **validateEmail**: a good address gives `{ valid: true }`. `''` and `'   '` give `Email is required`. `'not-an-email'` gives `Invalid email format`.
- **generateSlug**: `Hello World` → `hello-world`, `Nairobi's Best Coffee!` (with or without extra spaces) → `nairobis-best-coffee`
- **calculateDiscount**: 10% off 1000 is 900, 0% off 500 is 500, and -5% or 150% throws. The call is wrapped in an arrow function (`expect(() => ...).toThrow()`) so Vitest can catch the error.
- **formatDate**: `2025-06-15T10:30:00Z` → `15 Jun 2025`

## Task 2: API tests with Supertest

`app.js` builds the Express app and exports it. Only `server.js` calls `app.listen()`. Supertest takes the app object and sends fake HTTP requests straight to it, so tests never need a real port and can't clash with a running server.

Endpoints:

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/api/products` | 200, array of products | |
| POST | `/api/products` | 201, new product with `id` | 400 if `name` or `price` is missing or invalid |
| GET | `/api/products/:id` | 200, the product | 404 if not found |
| DELETE | `/api/products/:id` | 204, empty body | 404 if not found |

Products live in an array in memory, starting with Ketepa Tea, Tusker Lager and Jogoo Maize Flour. The app also exports `resetProducts()`, and the tests call it in `beforeEach`, so every test starts with the same three products. Without that, the POST test would add a product and the DELETE test would remove one, and the tests would depend on the order they run in.

Beyond the status code, the tests also check the data. After POST, the list really has 4 items. After DELETE, fetching the same id gives 404.

## Task 3: React component tests

`Greeting` is a small form. You type a name and submit. "Loading..." shows for 100ms, then "Hello, {name}! Welcome to Mctaba Academy." replaces the form. An empty submit shows "Name is required" in an element with `role="alert"`.

The five tests:

1. **Renders correctly**: finds the heading "Welcome", the Submit button and the "Your name" input by role and label, the way a user would see them.
2. **Shows greeting after submitting**: types with `userEvent` (real key presses), clicks Submit, then `await findByText(...)` waits for the greeting to appear.
3. **Form submission updates the message**: uses `fireEvent.change` and `fireEvent.submit` on the form itself. Also checks that the form (Submit button) is gone afterwards.
4. **Loading state**: straight after the click, the 100ms timer hasn't finished, so `getByText('Loading...')` finds it. After the greeting appears, `queryByText('Loading...')` returns null.
5. **Error message**: clicks Submit with an empty input and checks that `getByRole('alert')` has the text "Name is required".

`getBy...` fails straight away if the element isn't there. `queryBy...` returns `null` instead, which is useful for checking that something is *not* shown. `findBy...` is async and keeps retrying for up to 1 second, which is needed for anything that appears after a timer or a fetch.

## Coverage

`npm run test:coverage` (uses `@vitest/coverage-v8`):

```
Statements   : 95.89%
Branches     : 83.78%
Functions    : 100%
Lines        : 95.38%
```

The few uncovered lines are error branches the assignment didn't ask to test (for example, POST with a name but no price, and `calculateDiscount` with a negative price).

## Tech used

- Express 5, cors
- Vitest 4, Supertest, @vitest/coverage-v8
- React 19, React Testing Library, @testing-library/user-event, @testing-library/jest-dom, jsdom
