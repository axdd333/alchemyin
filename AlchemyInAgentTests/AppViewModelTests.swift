import XCTest
@testable import AlchemyInAgent

@MainActor
final class AppViewModelTests: XCTestCase {
    func testSeededInitialMessageExists() {
        let viewModel = AppViewModel()
        XCTAssertEqual(viewModel.messages.count, 1)
        XCTAssertEqual(viewModel.messages.first?.role, .agent)
        XCTAssertFalse(viewModel.messages.first?.content.isEmpty ?? true)
    }

    func testSendCommandAppendsUserMessageAndClearsDraft() {
        let viewModel = AppViewModel()
        viewModel.draftCommand = "Open Chrome and search for SwiftUI"

        viewModel.sendCommand()

        XCTAssertEqual(viewModel.messages.last?.role, .user)
        XCTAssertEqual(viewModel.messages.last?.content, "Open Chrome and search for SwiftUI")
        XCTAssertEqual(viewModel.draftCommand, "")
        XCTAssertEqual(viewModel.agentState, .processing)
    }

    func testToolTriggerAppendsStubAgentMessage() {
        let viewModel = AppViewModel()

        viewModel.triggerTool("Browse Web")

        XCTAssertEqual(viewModel.messages.last?.role, .agent)
        XCTAssertEqual(viewModel.messages.last?.content, "[Tool Stub] Browse Web is not connected yet.")
    }

    func testQuickActionImmediatelyAppendsUserMessage() {
        let viewModel = AppViewModel()

        viewModel.applyQuickAction("Make a 3-step execution plan")

        XCTAssertEqual(viewModel.messages.last?.role, .user)
        XCTAssertEqual(viewModel.messages.last?.content, "Make a 3-step execution plan")
        XCTAssertEqual(viewModel.agentState, .processing)
    }

    func testClearConversationResetsStateAndSingleSeedMessage() {
        let viewModel = AppViewModel()
        viewModel.triggerTool("Create File")
        viewModel.latencyMs = 25

        viewModel.clearConversation()

        XCTAssertEqual(viewModel.messages.count, 1)
        XCTAssertEqual(viewModel.messages.first?.role, .agent)
        XCTAssertEqual(viewModel.agentState, .ready)
        XCTAssertEqual(viewModel.latencyMs, 8)
    }

    func testMessageRetentionCapsHistory() {
        let viewModel = AppViewModel()

        for _ in 0..<120 {
            viewModel.triggerTool("Attach Files")
        }

        XCTAssertLessThanOrEqual(viewModel.messages.count, 80)
    }
}
