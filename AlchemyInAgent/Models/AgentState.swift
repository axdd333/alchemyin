import SwiftUI

/// High-level state machine for the AI agent.
enum AgentState: String {
    case ready = "Ready"
    case processing = "Processing"

    var accentColor: Color {
        switch self {
        case .ready:
            return Color.cyan
        case .processing:
            return Color.purple
        }
    }

    var statusText: String {
        rawValue
    }
}
