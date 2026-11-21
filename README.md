# Wellspring Content Update Manager — Assignment 7

## 1. Project Overview

The Wellspring Content Update Manager is a web application designed to help Wellspring on Main staff manage website content updates.

The application replaces the simulated workflow from Assignment 6 with a database-backed system using Astro and Supabase.

### Main Features

- Staff authentication using Supabase Auth.
- Role-based access control for Programs Leads, Events Leads, Content Owners, and the Executive Director.
- Submission of website content update requests.
- Review and approval or rejection of submitted requests.
- Automatic database content updates when requests are approved.
- Content archiving with ownership and pending-request restrictions.
- Server-side validation and permission enforcement.

## 2. Technologies Used

- Astro — Web application framework.
- TypeScript — Application and API logic.
- Supabase — PostgreSQL database and authentication.
- HTML, CSS, and JavaScript — User interface.
- Node.js and npm — Development and build tools.

## 3. Installation and Setup

1. Download or clone the project repository.
2. Open the project folder in Visual Studio Code.
3. Open the integrated terminal.
4. Install dependencies:

   `npm install`

5. Create a `.env` file using `.env.example` as a reference.
6. Configure the required Supabase environment variables.
7. Set up the Supabase database, authentication, staff records, and permissions using the available SQL scripts and project setup instructions.
8. Start the development server:

   `npm run dev`

9. Open the local address displayed in the terminal.

### Environment Configuration

The `.env` file contains environment-specific configuration and must not be committed to the repository.

The `.env.example` file provides a reference for the required configuration without exposing credentials.

## 4. Application Workflow

### Submit an Update Request

1. Sign in as a Programs Lead or Events Lead.
2. Navigate to the staff dashboard.
3. Select "Submit an update request."
4. Choose the website content item.
5. Enter the proposed changes.
6. Submit the request.
7. View the request in the update requests list.

### Review an Update Request

1. Sign in as the Content Owner responsible for the content.
2. Open the review queue.
3. Select a pending request.
4. Review the proposed changes and existing website text.
5. Edit the updated website text if necessary.
6. Select "Approve and publish" or "Reject."

Approved requests update the associated content record in Supabase.

Rejected requests retain the existing website content.

### Archive Website Content

1. Sign in as a Content Owner.
2. Navigate to "My content."
3. Locate an item owned by the signed-in staff member.
4. Select "Archive."
5. Confirm the operation.

Content cannot be archived when it has pending update requests.

Users cannot archive content owned by another staff member.

## 5. Database

The application uses the following Supabase tables:

- `staff`
- `web_page`
- `content_item`
- `update_request`
- `audience`
- `content_audience`

The database stores staff information, website pages, content records, audiences, and update requests.

Authentication is connected to staff records through the `auth_user_id` field.

Available database scripts include:

- `01_auth_setup.sql`
- `02_link_test_accounts.sql`
- `03_feature_access.sql`

## 6. Testing and Validation

The application was tested using different staff roles to verify access restrictions and functionality.

Tests included:

- Submitting update requests.
- Filtering requests by status.
- Approving and rejecting requests.
- Verifying database changes in Supabase.
- Preventing unauthorized users from archiving content.
- Preventing Content Owners from archiving another owner's content.
- Preventing archiving while an update request is pending.

### Development Checks

Astro diagnostics completed with:

- 0 errors
- 0 warnings
- 0 hints

The production build completed successfully using:

`npm run build`

## 7. Known Limitations

- The original database schema and sample-data SQL file is not included in the current project files.
- Supabase configuration and test accounts must be established before the database-backed application can be used.
- The application is intended for coursework demonstration and testing.

## 8. Team Contributions

Caitlin Hartman - Database Manager, Web Content Copywriter
Rosa Vargas - Lead Videographer/Editor, Photography
Preston Page - Videopgrapher/Editor, Photography
Hamshini Ananth - ERD Design and Workflow Specialist
Andrew Looney - Motion Graphic Designer
Dylan McKoy - Database Manager, Supabase Manager

## 9. AI Assistance

AI tools were used to assist with development, and troubleshooting.

Assistance included:

- Explaining Astro routing and file organization.
- Troubleshooting TypeScript errors.
- Debugging application build issues.
- Explaining Supabase authentication and database operations.
- Supporting API development and testing.

All generated code and suggestions were reviewed and tested during development.

## 10. Project Files

- `src/pages/staff/` — Staff dashboard and protected pages.
- `src/pages/staff/requests/` — Request submission, listing, and review pages.
- `src/pages/staff/content/` — Content management pages.
- `src/pages/api/` — Server-side API endpoints.
- `src/lib/` — Authentication, permissions, and helper functions.
- `src/layouts/` — Shared application layouts.
- `database/` — Available SQL scripts.
- `.env.example` — Environment configuration reference.
- `README.md` — Project documentation.
