import Foundation
import SwiftUI

/// Central app-level state for the SwiftUI screens.
@MainActor
final class AppViewModel: ObservableObject {
    @Published var messages: [ChatMessage] = []
    @Published var draftCommand: String = ""
    @Published var agentState: AgentState = .ready
    @Published var latencyMs: Int = 8
    @Published var fpsLabel: String = "60 FPS"
    @Published var isConnected: Bool = false
    @Published var connectionMessage: String? = "Operator not connected"

    private var processingTask: Task<Void, Never>?

    private let maxRetainedMessages = 80
    private let thinkingDelayMs = 350...800
    private let streamDelayMs = 14...18

    init() {
        seedMessages()
    }

    deinit {
        processingTask?.cancel()
    }

    func sendCommand() {
        let trimmed = draftCommand.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        appendMessage(ChatMessage(role: .user, content: trimmed))
        draftCommand = ""

        processingTask?.cancel()
        processingTask = Task {
            await processUserCommand(trimmed)
        }
    }

    func applyQuickAction(_ prompt: String) {
        draftCommand = prompt
        sendCommand()
    }

    func clearConversation() {
        processingTask?.cancel()
        processingTask = nil
        agentState = .ready
        latencyMs = 8
        seedMessages()
    }
    
    func setConnection(_ connected: Bool, message: String? = nil) {
        isConnected = connected
        connectionMessage = connected ? nil : (message ?? connectionMessage)
    }

    func triggerTool(_ name: String) {
        // Stub action for tool row buttons. Replace with real integrations later.
        appendMessage(ChatMessage(role: .agent, content: "[Tool Stub] \(name) is not connected yet."))
    }

    private func processUserCommand(_ command: String) async {
        agentState = .processing
        latencyMs = Int.random(in: 12...40)

        do {
            try await Task.sleep(for: .milliseconds(Int.random(in: thinkingDelayMs)))

            let response = "Understood. I’ll execute: \"\(command)\". " +
            "I’m outlining safe steps and preparing a concise action plan."

            let streamingID = UUID()
            appendMessage(ChatMessage(id: streamingID, role: .agent, content: ""))

            for character in response {
                try Task.checkCancellation()
                try await Task.sleep(for: .milliseconds(Int.random(in: streamDelayMs)))

                if let index = messages.firstIndex(where: { $0.id == streamingID }) {
                    messages[index].content.append(character)
                }
            }

            latencyMs = Int.random(in: 7...16)
            agentState = .ready
        } catch {
            agentState = .ready
            latencyMs = 8
        }
    }

    private func appendMessage(_ message: ChatMessage) {
        messages.append(message)
        trimMessagesIfNeeded()
    }

    private func trimMessagesIfNeeded() {
        guard messages.count > maxRetainedMessages else { return }
        let overflow = messages.count - maxRetainedMessages
        messages.removeFirst(overflow)
    }

    private func seedMessages() {
        messages = [
            ChatMessage(
                role: .agent,
                content: "Welcome to Atelier — by Alchemy. Ask the operator to browse, draft plans, summarize information, or execute task flows.",
                timestamp: Date().addingTimeInterval(-120)
            )
        ]
    }
}

