import SwiftUI

/// Primary screen containing status, conversation timeline, tools, desktop focus area, and command input.
struct MainAgentView: View {
    @StateObject private var viewModel = AppViewModel()

    @State private var desktopPanelHeight: CGFloat = 210
    @State private var showControlDeck = false
    @State private var dragStartHeight: CGFloat?

    private let minDesktopHeight: CGFloat = 170
    private let maxDesktopHeight: CGFloat = 430

    private var focusProgress: CGFloat {
        let range = maxDesktopHeight - minDesktopHeight
        guard range > 0 else { return 0 }
        return max(0, min(1, (desktopPanelHeight - minDesktopHeight) / range))
    }

    private var displayedMessages: [ChatMessage] {
        if focusProgress > 0.62 {
            return Array(viewModel.messages.suffix(2))
        }
        return viewModel.messages
    }

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

                desktopFocusPanel

                quickActionsRow
                    .opacity(1 - (focusProgress * 0.35))

                chatSection

                toolRow

                controlDeckToggle

                if showControlDeck {
                    controlDeck
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }

                CommandInputBar(text: $viewModel.draftCommand) {
                    viewModel.sendCommand()
                }

                footerHint
            }
            .padding(16)
        }
        .animation(.easeInOut(duration: 0.25), value: showControlDeck)
    }

    private var desktopFocusPanel: some View {
        VStack(spacing: 10) {
            Capsule()
                .fill(.white.opacity(0.35))
                .frame(width: 42, height: 5)

            HStack {
                Label("Desktop", systemImage: "display")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                Spacer()
                Text(focusProgress > 0.6 ? "Focused" : "Context")
                    .font(.system(size: 12, weight: .medium, design: .rounded))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Capsule().fill(Color.white.opacity(0.08)))
            }
            .foregroundStyle(.white.opacity(0.9))

            ZStack {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color.black.opacity(0.35))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(Color.cyan.opacity(0.25), lineWidth: 1)
                    )

                VStack(spacing: 8) {
                    Image(systemName: "macwindow.on.rectangle")
                        .font(.system(size: 32, weight: .medium))
                        .foregroundStyle(.cyan.opacity(0.9))
                    Text("Drag down to focus desktop view")
                        .font(.system(size: 12, weight: .medium, design: .rounded))
                        .foregroundStyle(.white.opacity(0.62))
                }
            }
            .frame(height: max(70, desktopPanelHeight - 58))
        }
        .padding(12)
        .frame(maxWidth: .infinity)
        .frame(height: desktopPanelHeight)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(Color.white.opacity(0.05))
                .overlay(RoundedRectangle(cornerRadius: 20).stroke(Color.white.opacity(0.12), lineWidth: 1))
        )
        .gesture(
            DragGesture(minimumDistance: 2)
                .onChanged { value in
                    let start = dragStartHeight ?? desktopPanelHeight
                    dragStartHeight = start
                    desktopPanelHeight = max(
                        minDesktopHeight,
                        min(maxDesktopHeight, start + value.translation.height)
                    )
                }
                .onEnded { _ in
                    dragStartHeight = nil
                }
        )
    }

    private var chatSection: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 16) {
                    ForEach(displayedMessages) { message in
                        MessageBubbleView(message: message, isEphemeral: focusProgress > 0.62)
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
            .opacity(1 - (focusProgress * 0.5))
            .scaleEffect(1 - (focusProgress * 0.04), anchor: .top)
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
        .opacity(1 - (focusProgress * 0.25))
    }

    private var controlDeckToggle: some View {
        HStack {
            Text("Input Deck")
                .font(.system(size: 13, weight: .semibold, design: .rounded))
                .foregroundStyle(.white.opacity(0.75))

            Spacer()

            Button(showControlDeck ? "Hide" : "Show Trackpad + Keyboard") {
                showControlDeck.toggle()
            }
            .font(.system(size: 12, weight: .semibold, design: .rounded))
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Capsule().fill(Color.white.opacity(0.08)))
            .foregroundStyle(.white)
            .buttonStyle(.plain)
        }
    }

    private var controlDeck: some View {
        VStack(spacing: 10) {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(Color.white.opacity(0.06))
                .overlay(
                    Text("Trackpad")
                        .foregroundStyle(.white.opacity(0.7))
                        .font(.system(size: 12, weight: .semibold, design: .rounded))
                )
                .frame(height: 74)

            VStack(spacing: 6) {
                keyboardRow(["⌘", "⌥", "⌃", "⇧", "Tab", "Space", "↩︎"])
                keyboardRow(["←", "↑", "↓", "→", "Esc", "Fn"])
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(Color.black.opacity(0.25))
                .overlay(RoundedRectangle(cornerRadius: 18).stroke(Color.white.opacity(0.1), lineWidth: 1))
        )
    }

    private func keyboardRow(_ keys: [String]) -> some View {
        HStack(spacing: 6) {
            ForEach(keys, id: \.self) { key in
                Text(key)
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                    .foregroundStyle(.white.opacity(0.9))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 9)
                    .background(
                        RoundedRectangle(cornerRadius: 9, style: .continuous)
                            .fill(Color.white.opacity(0.08))
                    )
            }
        }
    }

    private var footerHint: some View {
        HStack {
            Text(focusProgress > 0.62 ? "Desktop focus mode on" : "Press Enter to execute")
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
