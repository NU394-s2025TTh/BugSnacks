# BugSnacks - Team Purple

## UI Info

_todo_

## API Schema

**Base Path:** `/api/`

### Root

- `GET /api/`
  - Description: Returns a simple API identifier string.
  - Response: `200 OK` - "BugSnacks API"

### Projects (`/api/projects/`)

- `POST /api/projects/`

  - Description: Creates a new project.
  - Request Body (`CreateProjectRequestBody`):
    - `name`: string
    - `userId`: string
    - `description`: string
    - `campusId`: string
  - Response: `201 Created` - `{ message: 'Project created successfully', projectId: '...' }` or `500 Error`

- `GET /api/projects/{id}`

  - Description: Retrieves a specific project by its ID.
  - Path Parameter: `id` (string) - The ID of the project.
  - Response: `200 OK` - Project data object or `404 Not Found` / `500 Error`

- `GET /api/projects/campus/{campusId}`

  - Description: Retrieves projects by its campus.
  - Path Parameter: `campusId` (string) - The ID of the campus.
  - Response: `200 OK` - array of Project data object or `404 Not Found` / `500 Error`

- `PATCH /api/projects/{id}`

  - Description: Updates fields of a specific project.
  - Path Parameter: `id` (string) - The ID of the project.
  - Request Body (`Omit<Partial<Project>, 'projectId' | 'developerId' | 'createdAt'>`): Object containing fields to update (e.g., `name`, `description`, `campusId`).
  - Response: `200 OK` - `{ message: 'Project updated successfully', status: ... }` or `404 Not Found` / `500 Error`

- `DELETE /api/projects/{id}`

  - Description: Deletes a specific project by its ID.
  - Path Parameter: `id` (string) - The ID of the project.
  - Response: `200 OK` - `{ message: 'Project deleted successfully' }` or `404 Not Found` / `500 Error`

- `GET /api/projects/{id}/requests`

  - Description: Retrieves all test requests associated with a specific project.
  - Path Parameter: `id` (string) - The ID of the project.
  - Response: `200 OK` - Array of test request objects or `404 Not Found` / `500 Error`

- `GET /api/projects/`
  - Description: Returns a simple identifier string for the project routes.
  - Response: `200 OK` - "Hello Project!"

### Users (`/api/users/`)

- `POST /api/users/`

  - Description: Creates a new user. (**Note:** Code currently saves to 'bugs' collection due to `userCollection` initialization).
  - Request Body (`CreateUserRequestBody`):
    - `name`: string
    - `email`: string
    - `campusId`: string
  - Response: `201 Created` - `{ message: 'User created successfully', userId: '...' }` or `500 Error`

- `GET /api/users/{id}`

  - Description: Retrieves a specific user by ID. (**Note:** Code currently reads from 'bugs' collection).
  - Path Parameter: `id` (string) - The ID of the user.
  - Response: `200 OK` - User data object or `404 Not Found` / `500 Error`

- `PATCH /api/users/{id}`

  - Description: Updates fields of a specific user. (**Note:** Code currently updates in 'bugs' collection).
  - Path Parameter: `id` (string) - The ID of the user.
  - Request Body (`Partial<Omit<User, 'userId' | 'createdAt'>>`): Object containing fields to update (e.g., `name`, `email`, `campusId`).
  - Response: `200 OK` - `{ message: 'User updated successfully', status: ... }` or `404 Not Found` / `500 Error`

- `DELETE /api/users/{id}`

  - Description: Deletes a specific user by ID. (**Note:** Code currently deletes from 'bugs' collection).
  - Path Parameter: `id` (string) - The ID of the user.
  - Response: `200 OK` - `{ message: 'User deleted successfully' }` or `404 Not Found` / `500 Error`

- `GET /api/users/{id}/projects`

  - Description: Retrieves all projects associated with a specific user (developer).
  - Path Parameter: `id` (string) - The ID of the user (developer).
  - Response: `200 OK` - Array of project objects or `404 Not Found` / `500 Error`

- `GET /api/users/{id}/bugReports`

  - Description: Retrieves all bug reports submitted by a specific user (tester).
  - Path Parameter: `id` (string) - The ID of the user (tester).
  - Response: `200 OK` - Array of bug report objects or `404 Not Found` / `500 Error`

- `GET /api/users/`
  - Description: Returns a simple identifier string for the user routes.
  - Response: `200 OK` - "Hello Users!"

### Test Requests (`/api/test-requests/`)

- `POST /api/test-requests/`

  - Description: Creates a new test request.
  - Request Body (`CreateTestRequestBody`):
    - `projectId`: string
    - `developerId`: string
    - `title`: string
    - `description`: string
    - `demoUrl`: string
    - `reward`: `Reward` | `Array<Reward>`
    - `status`: `TestRequestStatus` (enum)
  - Response: `201 Created` - `{ message: 'Test request created successfully', requestId: '...' }` or `500 Error`

- `GET /api/test-requests/{id}`

  - Description: Retrieves a specific test request by its ID.
  - Path Parameter: `id` (string) - The ID of the test request.
  - Response: `200 OK` - Test request data object or `404 Not Found` / `500 Error`

- `PATCH /api/test-requests/{id}`

  - Description: Updates fields of a specific test request.
  - Path Parameter: `id` (string) - The ID of the test request.
  - Request Body (`Omit<Partial<TestRequest>, 'requestId' | 'projectId' | 'developerId' | 'createdAt'>`): Object containing fields to update (e.g., `title`, `description`, `demoUrl`, `reward`, `status`).
  - Response: `200 OK` - `{ message: 'Test request updated successfully' }` or `404 Not Found` / `500 Error`

- `DELETE /api/test-requests/{id}`

  - Description: Deletes a specific test request by its ID.
  - Path Parameter: `id` (string) - The ID of the test request.
  - Response: `200 OK` - `{ message: 'Test request deleted successfully' }` or `404 Not Found` / `500 Error`

- `GET /api/test-requests/{id}/bugs`

  - Description: Retrieves all bug reports associated with a specific test request.
  - Path Parameter: `id` (string) - The ID of the test request.
  - Response: `200 OK` - Array of bug report objects or `404 Not Found` / `500 Error`

- `GET /api/test-requests/`
  - Description: Returns a simple identifier string for the test request routes.
  - Response: `200 OK` - "Hello TestRequest!"

### Bug Reports (`/api/bug-reports/`)

- `GET /api/bug-reports/{id}`

  - Description: Retrieves a specific bug report by its ID.
  - Path Parameter: `id` (string) - The ID of the bug report.
  - Response: `200 OK` - Bug report data object or `404 Not Found` / `500 Error`

- `PATCH /api/bug-reports/{id}`

  - Description: Updates fields of a specific bug report.
  - Path Parameter: `id` (string) - The ID of the bug report.
  - Request Body (`Omit<Partial<BugReport>, 'reportId' | 'testerId' | 'createdAt'>`): Object containing fields to update.
  - Response: `200 OK` - `{ message: 'Bug report updated successfully' }` or `404 Not Found` / `500 Error`

- `DELETE /api/bug-reports/{id}`

  - Description: Deletes a specific bug report by its ID.
  - Path Parameter: `id` (string) - The ID of the bug report.
  - Response: `200 OK` - `{ message: 'Bug report deleted successfully' }` or `404 Not Found` / `500 Error`

- `GET /api/bug-reports/`
  - Description: Returns a simple identifier string for the bug report routes.
  - Response: `200 OK` - "Hello BugReporter!"

### Campuses (`/api/campuses/`)

- `GET /api/campuses/`

  - Description: Retrieves list of valid campusIds
  - Response: `200 OK` - Array of `campusId` strings.

- `GET /api/campuses/{campusId}`

  - Description: Retrieves dining options for a specific campus.
  - Path Parameter: `campusId` (string) - The ID of the campus (e.g., "northwestern1").
  - Response: `200 OK` - Array of dining location strings or `404 Not Found`

- `GET /api/campuses/{campusId}/rewards`
  - Description: Retrieves a generated list of potential rewards based on dining options for a specific campus.
  - Path Parameter: `campusId` (string) - The ID of the campus.
  - Response: `200 OK` - Array of `Reward` objects or `404 Not Found`

---
