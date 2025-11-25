const joinNameParts = (parts = []) => {
  return parts
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(" ")
    .trim()
}

/**
 * Normalizes various user name shapes coming from different backend payloads.
 */
export const resolveUserDisplayName = (candidate, fallback = "-") => {
  const source = candidate?.user ?? candidate
  const profile = source?.profile ?? source?.user_profile

  const directNameCandidate = [
    source?.name,
    source?.full_name,
    source?.fullName,
    profile?.name,
    profile?.full_name,
    profile?.fullName,
  ].find((value) => typeof value === "string" && value.trim().length > 0)

  if (directNameCandidate) {
    return directNameCandidate.trim()
  }

  const composedName = [
    joinNameParts([source?.first_name, source?.last_name]),
    joinNameParts([source?.firstName, source?.lastName]),
    joinNameParts([profile?.first_name, profile?.last_name]),
    joinNameParts([profile?.firstName, profile?.lastName]),
  ].find((value) => value.length > 0)

  if (composedName) {
    return composedName
  }

  const identifier = [source?.username, source?.email, profile?.username, profile?.email]
    .find((value) => typeof value === "string" && value.trim().length > 0)

  if (identifier) {
    return identifier.trim()
  }

  return fallback
}
