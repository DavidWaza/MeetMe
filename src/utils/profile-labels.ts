/** "Architect at Studio Ode", or just the title when there is no real employer. */
export function jobLabelFrom(jobTitle: string | null, company: string | null): string | null {
  if (!jobTitle) return null
  return company && company !== 'Freelance' ? `${jobTitle} at ${company}` : jobTitle
}
