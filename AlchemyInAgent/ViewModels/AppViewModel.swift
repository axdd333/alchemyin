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

    private var processingTask: Task<Void, Never>?

    init() {
        seedMessages()
    }

    deinit {
        processingTask?.cancel()
    }

    func sendCommand() {
        let trimmed = draftCommand.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        let userMessage = ChatMessage(role: .user, content: trimmed)
        messages.append(userMessage)
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
        messages.removeAll()
        seedMessages()
    }

    func triggerTool(_ name: String) {
        // Stub action for tool row buttons. Replace with real integrations later.
        let stub = ChatMessage(role: .agent, content: "[Tool Stub] \(name) is not connected yet.")
        messages.append(stub)
    }

    private func processUserCommand(_ command: String) async {
        agentState = .processing
        latencyMs = Int.random(in: 12...42)

        do {
            try await Task.sleep(for: .milliseconds(Int.random(in: 350...800)))

            let response = "Got it — I'll handle: \"\(command)\". " +
            "I'm mapping the request into safe action steps and preparing a concise execution plan."

            var streamingMessage = ChatMessage(role: .agent, content: "")
            messages.append(streamingMessage)

            for character in response {
                try Task.checkCancellation()
                try await Task.sleep(for: .milliseconds(16))

                if let lastIndex = messages.indices.last,
                   messages[lastIndex].id == streamingMessage.id {
                    messages[lastIndex].content.append(character)
                }
            }

            latencyMs = Int.random(in: 7...16)
            agentState = .ready
        } catch {
            agentState = .ready
        }
    }

    private func seedMessages() {
        messages = [
            ChatMessage(
                role: .agent,
                content: "Welcome to AlchemyIn Agent. Ask me to browse, draft plans, summarize information, or execute task flows.",
                timestamp: Date().addingTimeInterval(-120)
            )
        ]
    }
}
