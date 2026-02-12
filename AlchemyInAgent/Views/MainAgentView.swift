import SwiftUI

/// Primary screen containing status, conversation timeline, tools, and command input.
struct MainAgentView: View {
    @StateObject private var viewModel = AppViewModel()

    var body: some View {
        ZStack {
            backgroundGradient

            VStack(spacing: 12) {
                AgentStatusHeader(
                    title: "Alchemy Agent",
                    state: viewModel.agentState,
                    latencyMs: viewModel.latencyMs,
                    fpsLabel: viewModel.fpsLabel
                )

                quickActionsRow

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
                LazyVStack(alignment: .leading, spacing: 16) {
                    ForEach(viewModel.messages) { message in
                        MessageBubbleView(message: message)
                            .id(message.id)
                    }

                    if viewModel.agentState == .processing {
                        HStack(spacing: 10) {
                            ProgressView()
                                .tint(.cyan)
                            Text("Agent is thinking…")
                                .foregroundStyle(.white.opacity(0.65))
                                .font(.system(size: 14, weight: .medium, design: .rounded))
                        }
                        .padding(.leading, 4)
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 12)
            }
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(Color.black.opacity(0.25))
                    .overlay(
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .stroke(Color.white.opacity(0.08), lineWidth: 1)
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

    private var quickActionsRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                QuickActionChip(title: "Summarize latest updates") {
                    viewModel.applyQuickAction("Summarize the latest updates and suggest priorities.")
                }
                QuickActionChip(title: "Plan my day") {
                    viewModel.applyQuickAction("Build a focused plan for today in 5 clear steps.")
                }
                QuickActionChip(title: "Clean up chat") {
                    viewModel.clearConversation()
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
        .font(.system(size: 14, weight: .regular, design: .rounded))
        .padding(.horizontal, 6)
    }

    private var backgroundGradient: some View {
        LinearGradient(
            colors: [
                Color(red: 0.02, green: 0.03, blue: 0.12),
                Color(red: 0.08, green: 0.03, blue: 0.14),
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

private struct QuickActionChip: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 13, weight: .semibold, design: .rounded))
                .foregroundStyle(.white.opacity(0.88))
                .padding(.vertical, 8)
                .padding(.horizontal, 12)
                .background(
                    Capsule()
                        .fill(Color.white.opacity(0.06))
                        .overlay(Capsule().stroke(Color.white.opacity(0.15), lineWidth: 1))
                )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    MainAgentView()
}
