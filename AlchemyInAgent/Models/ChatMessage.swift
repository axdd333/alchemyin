import Foundation

/// Represents who authored a message in the chat timeline.
enum MessageRole: String, Codable {
    case agent = "OPERATOR"
    case user = "YOU"
}

/// A single message item displayed in the conversation.
struct ChatMessage: Identifiable, Equatable {
    let id: UUID
    let role: MessageRole
    var content: String
    let timestamp: Date

    init(id: UUID = UUID(), role: MessageRole, content: String, timestamp: Date = Date()) {
        self.id = id
        self.role = role
        self.content = content
        self.timestamp = timestamp
    }
}

