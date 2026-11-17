// SAMPLE DATA (prototype only)
// Mirrors the tables and sample records in wellspring_content_db.sql (Assignment 4).
// Field names match the database. Dates are relative to today, like the SQL file.
// Changes are kept in browser memory and reset when the page reloads.

(function () {
  const day = 24 * 60 * 60 * 1000;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const daysAgo = (n) => new Date(today.getTime() - n * day);
  const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);

  window.SEED = {
    staff: [
      { staff_id: 1, full_name: "Jordan Ellis",   email: "jordan.ellis@wellspring-example.org",   role: "Content Owner" },
      { staff_id: 2, full_name: "Maya Okafor",    email: "maya.okafor@wellspring-example.org",    role: "Programs Lead" },
      { staff_id: 3, full_name: "Luis Romero",    email: "luis.romero@wellspring-example.org",    role: "Events Lead" },
      { staff_id: 4, full_name: "Priya Shah",     email: "priya.shah@wellspring-example.org",     role: "Content Owner" },
      { staff_id: 5, full_name: "Dana Whitfield", email: "dana.whitfield@wellspring-example.org", role: "Executive Director" }
    ],
    web_page: [
      { page_id: 1, page_title: "Home",                page_slug: "/" },
      { page_id: 2, page_title: "Programs & Classes",  page_slug: "/programs" },
      { page_id: 3, page_title: "Nonprofit Partners",  page_slug: "/nonprofits" },
      { page_id: 4, page_title: "Event Space Rentals", page_slug: "/event-rentals" },
      { page_id: 5, page_title: "Tenant Resources",    page_slug: "/tenants" }
    ],
    audience: [
      { audience_id: 1, audience_name: "Community Members" },
      { audience_id: 2, audience_name: "Nonprofits" },
      { audience_id: 3, audience_name: "Event Renters" },
      { audience_id: 4, audience_name: "Tenants" }
    ],
    content_item: [
      { content_id: 1, owner_staff_id: 1, page_id: 1, title: "Our Mission", body: "Wellspring is a community center that brings neighbors, nonprofits, and local events together under one roof.", status: "current", last_reviewed_date: daysAgo(20), is_published: true },
      { content_id: 2, owner_staff_id: 1, page_id: 2, title: "Saturday Youth Art Workshop", body: "Free art workshop for ages 8-14, Saturdays from 10:00 to 11:30 AM in Studio B.", status: "pending_review", last_reviewed_date: daysAgo(45), is_published: true },
      { content_id: 3, owner_staff_id: 4, page_id: 2, title: "Community Yoga", body: "Gentle yoga on Tuesday evenings at 6:00 PM. All levels welcome.", status: "current", last_reviewed_date: daysAgo(10), is_published: true },
      { content_id: 4, owner_staff_id: 4, page_id: 3, title: "Become a Nonprofit Partner", body: "Nonprofits can apply for discounted meeting space and shared office hours.", status: "current", last_reviewed_date: daysAgo(30), is_published: true },
      { content_id: 5, owner_staff_id: 1, page_id: 4, title: "Main Hall Rental Rates", body: "The Main Hall seats 120 guests. Weekend rates start at $400 for four hours.", status: "pending_review", last_reviewed_date: daysAgo(60), is_published: true },
      { content_id: 6, owner_staff_id: 4, page_id: 5, title: "Tenant Parking Information", body: "Tenants may park in the north lot. Permits are issued at the front desk.", status: "current", last_reviewed_date: daysAgo(120), is_published: true },
      { content_id: 7, owner_staff_id: 1, page_id: 2, title: "Summer Reading Camp 2025", body: "A four-week reading camp for elementary students, June 2 to June 27, 2025.", status: "archived", last_reviewed_date: daysAgo(200), is_published: false },
      { content_id: 8, owner_staff_id: 4, page_id: 3, title: "Nonprofit Resource Fair", body: "Join local nonprofits for an afternoon of networking and shared resources.", status: "current", last_reviewed_date: daysAgo(0), is_published: false },
      { content_id: 9, owner_staff_id: 1, page_id: 1, title: "Holiday Hours", body: "Wellspring is closed November 27-28 for Thanksgiving.", status: "needs_update", last_reviewed_date: daysAgo(330), is_published: true }
    ],
    content_audience: [
      [1, 1], [1, 2], [1, 3], [1, 4], [2, 1], [3, 1], [4, 2], [5, 3], [5, 2], [6, 4], [7, 1], [8, 2], [8, 1], [9, 1], [9, 4]
    ],
    update_request: [
      { request_id: 1, content_id: 2, submitted_by_staff_id: 2, reviewed_by_staff_id: null, proposed_details: "Workshop is moving to Saturdays 1:00-2:30 PM starting next month. Room changes to Studio A.", request_status: "pending", submitted_at: hoursAgo(48), reviewed_at: null },
      { request_id: 2, content_id: 5, submitted_by_staff_id: 3, reviewed_by_staff_id: null, proposed_details: "Weekend Main Hall rate is now $450 for four hours. Add $75 per extra hour.", request_status: "pending", submitted_at: hoursAgo(120), reviewed_at: null },
      { request_id: 3, content_id: 3, submitted_by_staff_id: 2, reviewed_by_staff_id: 4, proposed_details: "Add a second session on Thursdays at 6:00 PM.", request_status: "approved", submitted_at: hoursAgo(360), reviewed_at: hoursAgo(240) },
      { request_id: 4, content_id: 4, submitted_by_staff_id: 5, reviewed_by_staff_id: 4, proposed_details: "Change the partner discount to 50 percent.", request_status: "rejected", submitted_at: hoursAgo(840), reviewed_at: hoursAgo(720) }
    ]
  };
})();
