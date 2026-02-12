import SwiftUI

/// Primary screen containing status, conversation timeline, tools, and command input.
struct MainAgentView: View {
    @StateObject private var viewModel = AppViewModel()

    var body: some View {
        ZStack {
            backgroundGradient

            VStack(spacing: 14) {
                AgentStatusHeader(
                    title: "Agent Vision",
                    state: viewModel.agentState,
                    latencyMs: viewModel.latencyMs,
                    fpsLabel: viewModel.fpsLabel
                )

                chatSection

                toolRow

                CommandInputBar(text: $viewModel.draftCommand) {
                    viewModel.sendCommand()
                }

                footerHint
            }
            .padding(16)
        }
    }

    private var chatSection: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 18) {
                    ForEach(viewModel.messages) { message in
                        MessageBubbleView(message: message)
                            .id(message.id)
                    }
                }
                .padding(.horizontal, 6)
                .padding(.vertical, 8)
            }
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(Color.black.opacity(0.2))
                    .overlay(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .stroke(Color.cyan.opacity(0.1), lineWidth: 1)
                    )
            )
            .onChange(of: viewModel.messages) { _, newValue in
                guard let last = newValue.last else { return }
                withAnimation(.easeOut(duration: 0.25)) {
                    proxy.scrollTo(last.id, anchor: .bottom)
                }
            }
        }
    }

    private var toolRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ToolButton(title: "Attach Files", systemImage: "paperclip") {
                    viewModel.triggerTool("Attach Files")
                }
                ToolButton(title: "Browse Web", systemImage: "safari") {
                    viewModel.triggerTool("Browse Web")
                }
                ToolButton(title: "Create File", systemImage: "doc.badge.plus") {
                    viewModel.triggerTool("Create File")
                }
                ToolButton(title: "Analyze Screen", systemImage: "viewfinder") {
                    viewModel.triggerTool("Analyze Screen")
                }
            }
        }
    }

    private var footerHint: some View {
        HStack {
            Text("Press Enter to execute")
            Spacer()
            Label("Autonomous mode active", systemImage: "bolt.fill")
                .foregroundStyle(Color.yellow.opacity(0.8))
        }
        .foregroundStyle(.white.opacity(0.35))
        .font(.system(size: 15, weight: .regular, design: .rounded))
        .padding(.horizontal, 6)
    }

    private var backgroundGradient: some View {
        LinearGradient(
            colors: [
                Color(red: 0.02, green: 0.03, blue: 0.12),
                Color(red: 0.10, green: 0.02, blue: 0.16),
                Color(red: 0.00, green: 0.06, blue: 0.08),
                Color.black
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .overlay(
            RadialGradient(
                colors: [Color.cyan.opacity(0.12), Color.clear],
                center: .bottom,
                startRadius: 10,
                endRadius: 450
            )
        )
        .ignoresSafeArea()
    }
}

#Preview {
    MainAgentView()
}
