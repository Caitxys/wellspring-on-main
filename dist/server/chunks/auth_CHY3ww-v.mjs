const PERMISSIONS = {
  submit_request: ["Programs Lead", "Events Lead"],
  review_request: ["Content Owner"],
  view_all_requests: ["Executive Director"],
  archive_content: ["Content Owner"]
};
function can(staff, permission) {
  return !!staff && PERMISSIONS[permission].includes(staff.role);
}
function permissionsFor(staff) {
  return Object.keys(PERMISSIONS).filter((p) => can(staff, p));
}

export { PERMISSIONS as P, can as c, permissionsFor as p };
