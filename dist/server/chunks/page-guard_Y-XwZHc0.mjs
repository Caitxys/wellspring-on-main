function requireStaffPage(Astro) {
  const { user, staff } = Astro.locals;
  if (!user) {
    const next = encodeURIComponent(Astro.url.pathname + Astro.url.search);
    return Astro.redirect(`/login?next=${next}`);
  }
  if (!staff) return Astro.redirect("/login?error=not_staff");
  return staff;
}

export { requireStaffPage as r };
