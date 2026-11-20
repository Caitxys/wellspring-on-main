/** A signed-in staff member, loaded from the staff table by src/middleware.ts. */
export type Staff = {
  staff_id: number;
  full_name: string;
  email: string;
  role: string;
};

/**
 * Which roles may do what. Roles are the values stored in staff.role.
 *
 * TODO (team): adjust this list to match your feature and business rules.
 * Keep it in one place so every page and API route uses the same rules.
 */
export const PERMISSIONS = {
  submit_request: ['Programs Lead', 'Events Lead'],
  review_request: ['Content Owner'],
  view_all_requests: ['Executive Director'],
  archive_content: ['Content Owner'],
} as const satisfies Record<string, readonly string[]>;

export type Permission = keyof typeof PERMISSIONS;

/** True if this staff member's role grants the permission. */
export function can(staff: Staff | null, permission: Permission): boolean {
  return !!staff && (PERMISSIONS[permission] as readonly string[]).includes(staff.role);
}

/** Every permission this staff member has (handy for menus and /api/me). */
export function permissionsFor(staff: Staff | null): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter((p) => can(staff, p));
}
