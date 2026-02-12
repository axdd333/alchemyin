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
}
