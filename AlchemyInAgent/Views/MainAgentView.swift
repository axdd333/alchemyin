import SwiftUI

/// Refined primary screen with a calmer, museum-like visual language.
struct MainAgentView: View {
    @StateObject private var viewModel = AppViewModel()

    @State private var desktopHeight: CGFloat = 190
    @State private var dragStartHeight: CGFloat?
    @State private var showInputDeck = false

    private let minDesktopHeight: CGFloat = 160
    private let maxDesktopHeight: CGFloat = 320

    private var focusProgress: CGFloat {
        let range = maxDesktopHeight - minDesktopHeight
        guard range > 0 else { return 0 }
        return max(0, min(1, (desktopHeight - minDesktopHeight) / range))
    }

    private var visibleMessages: [ChatMessage] {
        focusProgress > 0.58 ? Array(viewModel.messages.suffix(3)) : viewModel.messages
    }

    var body: some View {
        ZStack {
            background

            VStack(spacing: 12) {
                AgentStatusHeader(
                    title: "Alchemy Agent",
                    state: viewModel.agentState,
                    latencyMs: viewModel.latencyMs,
                    fpsLabel: viewModel.fpsLabel
                )

                desktopPanel

                chatSection

                controlsRow

                if showInputDeck {
                    inputDeck
                }

                CommandInputBar(text: $viewModel.draftCommand, onSend: viewModel.sendCommand)

                footer
            }
            .padding(16)
        }
        .animation(.easeInOut(duration: 0.22), value: showInputDeck)
    }

    private var desktopPanel: some View {
        VStack(spacing: 10) {
            Capsule()
                .fill(Color.white.opacity(0.25))
                .frame(width: 38, height: 4)

            HStack {
                Label("Desktop", systemImage: "display")
                Spacer()
                Text(focusProgress > 0.58 ? "Focused" : "Context")
                    .font(.system(size: 12, weight: .medium, design: .rounded))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Capsule().fill(Color.white.opacity(0.08)))
            }
            .font(.system(size: 14, weight: .semibold, design: .rounded))
            .foregroundStyle(Color(red: 0.93, green: 0.90, blue: 0.83))

            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color.black.opacity(0.25))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(Color(red: 0.62, green: 0.54, blue: 0.36).opacity(0.35), lineWidth: 1)
                )
                .overlay {
                    VStack(spacing: 8) {
                        Image(systemName: "macwindow.on.rectangle")
                            .font(.system(size: 30, weight: .regular))
                            .foregroundStyle(Color(red: 0.77, green: 0.68, blue: 0.47))
                        Text("Drag down to focus desktop")
                            .font(.system(size: 12, weight: .medium, design: .rounded))
                            .foregroundStyle(.white.opacity(0.55))
                    }
                }
                .frame(height: max(78, desktopHeight - 58))
        }
        .padding(12)
        .frame(height: desktopHeight)
        .background(panelBackground)
        .gesture(
            DragGesture(minimumDistance: 2)
                .onChanged { value in
                    let start = dragStartHeight ?? desktopHeight
                    dragStartHeight = start
                    desktopHeight = max(minDesktopHeight, min(maxDesktopHeight, start + value.translation.height))
                }
                .onEnded { _ in dragStartHeight = nil }
        )
    }

    private var chatSection: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 14) {
                    ForEach(visibleMessages) { message in
                        MessageBubbleView(message: message, isEphemeral: focusProgress > 0.58)
                            .id(message.id)
                    }

                    if viewModel.agentState == .processing {
                        Label("Agent is composing…", systemImage: "ellipsis.circle")
                            .font(.system(size: 13, weight: .medium, design: .rounded))
                            .foregroundStyle(.white.opacity(0.62))
                            .padding(.leading, 2)
                    }
                }
                .padding(12)
            }
            .background(panelBackground)
            .opacity(1 - (focusProgress * 0.35))
            .onChange(of: viewModel.messages) { _, newValue in
                guard let last = newValue.last else { return }
                withAnimation(.easeOut(duration: 0.22)) {
                    proxy.scrollTo(last.id, anchor: .bottom)
                }
            }
        }
    }

    private var controlsRow: some View {
        HStack(spacing: 10) {
            ToolButton(title: "Attach", systemImage: "paperclip") { viewModel.triggerTool("Attach Files") }
            ToolButton(title: "Browse", systemImage: "safari") { viewModel.triggerTool("Browse Web") }
            ToolButton(title: "Create", systemImage: "doc.badge.plus") { viewModel.triggerTool("Create File") }

            Spacer(minLength: 0)

            Button(showInputDeck ? "Hide Deck" : "Input Deck") {
                showInputDeck.toggle()
            }
            .font(.system(size: 12, weight: .semibold, design: .rounded))
            .foregroundStyle(Color(red: 0.93, green: 0.90, blue: 0.83))
            .padding(.horizontal, 12)
            .padding(.vertical, 9)
            .background(Capsule().fill(Color.white.opacity(0.08)))
            .buttonStyle(.plain)
        }
    }

    private var inputDeck: some View {
        VStack(spacing: 10) {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(Color.white.opacity(0.06))
                .frame(height: 62)
                .overlay(Text("Trackpad").foregroundStyle(.white.opacity(0.6)))

            HStack(spacing: 6) {
                ForEach(["⌘", "⌥", "⇧", "Tab", "Space", "↩"], id: \.self) { key in
                    Text(key)
                        .font(.system(size: 12, weight: .semibold, design: .rounded))
                        .foregroundStyle(.white.opacity(0.88))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color.white.opacity(0.08)))
                }
            }
        }
        .padding(12)
        .background(panelBackground)
    }

    private var footer: some View {
        HStack {
            Text(focusProgress > 0.58 ? "Desktop focus active" : "Press Enter to execute")
            Spacer()
            Label("Autonomous mode active", systemImage: "bolt.fill")
                .foregroundStyle(Color(red: 0.85, green: 0.71, blue: 0.29))
        }
        .font(.system(size: 14, weight: .regular, design: .rounded))
        .foregroundStyle(.white.opacity(0.42))
        .padding(.horizontal, 4)
    }

    private var panelBackground: some View {
        RoundedRectangle(cornerRadius: 20, style: .continuous)
            .fill(Color.white.opacity(0.04))
            .overlay(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(Color(red: 0.58, green: 0.50, blue: 0.35).opacity(0.22), lineWidth: 1)
            )
    }

    private var background: some View {
        LinearGradient(
            colors: [
                Color(red: 0.05, green: 0.06, blue: 0.12),
                Color(red: 0.08, green: 0.06, blue: 0.13),
                Color(red: 0.05, green: 0.08, blue: 0.10),
                Color(red: 0.03, green: 0.03, blue: 0.04)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .overlay(
            RadialGradient(
                colors: [Color(red: 0.68, green: 0.56, blue: 0.30).opacity(0.16), .clear],
                center: .bottom,
                startRadius: 4,
                endRadius: 430
            )
        )
        .ignoresSafeArea()
    }
}

#Preview {
    MainAgentView()
}
