import type { NegotiationSession } from "@/types"

const sessions = new Map<string, NegotiationSession>()

export function getSession(id: string): NegotiationSession | undefined {
  return sessions.get(id)
}

export function setSession(session: NegotiationSession): void {
  sessions.set(session.id, session)
}

export function deleteSession(id: string): void {
  sessions.delete(id)
}

export function listSessions(): NegotiationSession[] {
  return Array.from(sessions.values())
}

export function createSession(parties: NegotiationSession["parties"]): NegotiationSession {
  const session: NegotiationSession = {
    id: crypto.randomUUID(),
    status: "active",
    parties,
    terms: [],
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  sessions.set(session.id, session)
  return session
}
