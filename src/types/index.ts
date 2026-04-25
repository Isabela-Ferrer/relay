export type NegotiationStatus = "pending" | "active" | "converging" | "agreed" | "failed"

export type DocumentType = "NDA" | "CIM" | "LOI"

export interface Party {
  id: string
  name: string
  role: "buyer" | "seller"
}

export interface NegotiationTerm {
  key: string
  label: string
  buyerPosition: string | number
  sellerPosition: string | number
  agreedValue?: string | number
  converged: boolean
}

export interface NegotiationSession {
  id: string
  status: NegotiationStatus
  parties: [Party, Party]
  terms: NegotiationTerm[]
  messages: AgentMessage[]
  createdAt: string
  updatedAt: string
}

export interface AgentMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  reasoning?: string
}

export interface ConvergenceDataPoint {
  round: number
  gap: number
  buyerOffer: number
  sellerOffer: number
}

export interface GeneratedDocument {
  type: DocumentType
  content: string
  sessionId: string
  generatedAt: string
}
