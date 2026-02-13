import SwiftUI

/// Primary operator console designed around the idea that the AI agent runs on its own desktop.
struct MainAgentView: View {
    @StateObject private var viewModel = AppViewModel()

    @State private var desktopHeight: CGFloat = 240
    @State private var dragStartHeight: CGFloat?
    @State private var showInputDeck = false
    @State private var isDesktopCollapsed = false

    private let minDesktopHeight: CGFloat = 170
    private let maxDesktopHeight: CGFloat = 360

    private let tools: [(String, String, String)] = [
        ("Open Browser", "safari", "Browse Web"),
        ("Plan", "list.bullet.clipboard", "Draft Plan"),
        ("Write", "doc.text", "Create File")
    ]

    private let quickActions = [
        "Audit current desktop session",
        "Research and summarize top 5 findings",
        "Draft execution checklist"
    ]

    private var focusProgress: CGFloat {
        let range = maxDesktopHeight - minDesktopHeight
        guard range > 0 else { return 0 }
        return max(0, min(1, (desktopHeight - minDesktopHeight) / range))
    }

    private var visibleMessages: [ChatMessage] {
        focusProgress > 0.55 ? Array(viewModel.messages.suffix(4)) : viewModel.messages
    }

    private var desktopStatusText: String {
        if !viewModel.isConnected {
            return viewModel.connectionMessage ?? "Operator not connected"
        }

        return viewModel.agentState == .processing ? "Executing command" : "Awaiting objective"
    }

    var body: some View {
        ZStack {
            background

            VStack(spacing: 12) {
                topBar

                if !isDesktopCollapsed {
                    autonomousDesktopPanel
                }

                if showInputDeck {
                    quickActionStrip
                    controlsRow
                }

                chatSection
                CommandInputBar(text: $viewModel.draftCommand, onSend: viewModel.sendCommand)
                footer
            }
            .padding(16)
        }
        .animation(.easeInOut(duration: 0.22), value: isDesktopCollapsed)
        .animation(.easeInOut(duration: 0.22), value: showInputDeck)
    }

    private var topBar: some View {
        HStack(spacing: 10) {
            VStack(alignment: .leading, spacing: 2) {
                Text("Atelier")
                    .font(.system(size: 22, weight: .semibold, design: .serif))
                    .foregroundStyle(Color(red: 0.95, green: 0.92, blue: 0.86))

                Text("Autonomous operator desktop")
                    .font(.system(size: 11, weight: .medium, design: .rounded))
                    .foregroundStyle(.white.opacity(0.58))
            }

            Spacer()

            statusPill

            capsuleToggleButton(
                label: "Desktop",
                icon: isDesktopCollapsed ? "rectangle.expand.vertical" : "rectangle.compress.vertical",
                isActive: !isDesktopCollapsed
            ) {
                isDesktopCollapsed.toggle()
            }

            capsuleToggleButton(
                label: "Deck",
                icon: "rectangle.3.group",
                isActive: showInputDeck
            ) {
                showInputDeck.toggle()
            }
        }
        .padding(12)
        .background(panelBackground)
    }

    private var statusPill: some View {
        let tint: Color = viewModel.isConnected
            ? (viewModel.agentState == .ready ? Color(red: 0.63, green: 0.85, blue: 0.88) : Color(red: 0.87, green: 0.74, blue: 0.54))
            : .white.opacity(0.75)

        return HStack(spacing: 7) {
            Circle()
                .fill(tint)
                .frame(width: 7, height: 7)

            Text(desktopStatusText)
                .lineLimit(1)
                .minimumScaleFactor(0.9)
                .font(.system(size: 12, weight: .semibold, design: .rounded))
                .foregroundStyle(tint)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .background(Capsule().fill(Color.white.opacity(0.06)))
        .overlay(Capsule().stroke(Color.white.opacity(0.14), lineWidth: 1))
    }

    private func capsuleToggleButton(label: String, icon: String, isActive: Bool, action: @escaping () -> Void) -> some View {
        Button(action: {
            withAnimation(.easeInOut(duration: 0.22), action)
        }) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                Text(label)
            }
            .lineLimit(1)
            .minimumScaleFactor(0.9)
            .font(.system(size: 12, weight: .semibold, design: .rounded))
            .foregroundStyle(isActive ? Color(red: 0.94, green: 0.90, blue: 0.82) : .white.opacity(0.82))
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .background(Capsule().fill(Color.white.opacity(isActive ? 0.10 : 0.05)))
            .overlay(Capsule().stroke(Color.white.opacity(0.14), lineWidth: 1))
        }
        .buttonStyle(.plain)
    }

    private var autonomousDesktopPanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Label("Agent Desktop", systemImage: "desktopcomputer")
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
                    .foregroundStyle(.white.opacity(0.86))

                Spacer()

                Text("Latency \(viewModel.latencyMs)ms")
                    .font(.system(size: 11, weight: .medium, design: .monospaced))
                    .foregroundStyle(.white.opacity(0.60))
            }

            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color.black.opacity(0.28))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(Color.white.opacity(0.12), lineWidth: 1)
                )
                .overlay(alignment: .topLeading) {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack(spacing: 8) {
                            Circle().fill(Color(red: 0.83, green: 0.40, blue: 0.40)).frame(width: 7, height: 7)
                            Circle().fill(Color(red: 0.88, green: 0.72, blue: 0.42)).frame(width: 7, height: 7)
                            Circle().fill(Color(red: 0.43, green: 0.78, blue: 0.56)).frame(width: 7, height: 7)
                        }

                        Text("Runtime Session")
                            .font(.system(size: 12, weight: .semibold, design: .rounded))
                            .foregroundStyle(.white.opacity(0.74))

                        Text(viewModel.agentState == .processing ? "Executing objective with autonomous reasoning..." : "Desktop idle. Waiting for next objective.")
                            .font(.system(size: 12, weight: .regular, design: .rounded))
                            .foregroundStyle(.white.opacity(0.58))
                            .lineLimit(2)

                        Divider().overlay(Color.white.opacity(0.10))

                        VStack(alignment: .leading, spacing: 6) {
                            ForEach(visibleMessages.suffix(2)) { message in
                                HStack(alignment: .top, spacing: 6) {
                                    Text(message.role.rawValue)
                                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                                        .foregroundStyle(.white.opacity(0.46))
                                        .frame(width: 52, alignment: .leading)

                                    Text(message.content)
                                        .font(.system(size: 11, weight: .regular, design: .rounded))
                                        .foregroundStyle(.white.opacity(0.72))
                                        .lineLimit(2)
                                }
                            }
                        }
                    }
                    .padding(12)
                }
                .frame(height: max(CGFloat(95), desktopHeight - 64))
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

    private var quickActionStrip: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(quickActions, id: \.self) { prompt in
                    Button {
                        viewModel.applyQuickAction(prompt)
                    } label: {
                        Text(prompt)
                            .lineLimit(1)
                            .font(.system(size: 12, weight: .medium, design: .rounded))
                            .foregroundStyle(.white.opacity(0.82))
                            .padding(.horizontal, 11)
                            .padding(.vertical, 7)
                            .background(Capsule().fill(Color.white.opacity(0.08)))
                            .overlay(Capsule().stroke(Color.white.opacity(0.16), lineWidth: 1))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .opacity(1 - Double(focusProgress) * 0.20)
    }

    private var chatSection: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 12) {
                    ForEach(visibleMessages) { message in
                        MessageBubbleView(message: message, isEphemeral: focusProgress > 0.55, compactChrome: true)
                            .id(message.id)
                    }

                    if viewModel.agentState == .processing {
                        Label("Operator is executing on its desktop…", systemImage: "ellipsis.circle")
                            .font(.system(size: 13, weight: .medium, design: .rounded))
                            .foregroundStyle(.white.opacity(0.62))
                            .padding(.leading, 2)
                    }
                }
                .padding(12)
            }
            .background(panelBackground)
            .opacity(1 - Double(focusProgress) * 0.28)
            .onChange(of: viewModel.messages) { _, newValue in
                guard let last = newValue.last else { return }
                withAnimation(.easeOut(duration: 0.22)) {
                    proxy.scrollTo(last.id, anchor: .bottom)
                }
            }
        }
    }

    private var controlsRow: some View {
        HStack(spacing: 8) {
            ForEach(tools, id: \.2) { tool in
                ToolButton(title: tool.0, systemImage: tool.1) {
                    viewModel.triggerTool(tool.2)
                }
            }

            Spacer(minLength: 0)

            Button(viewModel.messages.count > 1 ? "Reset" : "Hide Deck") {
                if viewModel.messages.count > 1 {
                    viewModel.clearConversation()
                } else {
                    showInputDeck = false
                }
            }
            .font(.system(size: 12, weight: .semibold, design: .rounded))
            .foregroundStyle(Color(red: 0.93, green: 0.90, blue: 0.83))
            .padding(.horizontal, 12)
            .padding(.vertical, 9)
            .background(Capsule().fill(Color.white.opacity(0.08)))
            .buttonStyle(.plain)
        }
    }

    private var footer: some View {
        HStack {
            Text(focusProgress > 0.55 ? "Desktop focus mode" : "Press Enter to dispatch objective")
            Spacer()
            Label("Autonomous mode active", systemImage: "bolt.fill")
                .foregroundStyle(Color.white.opacity(0.64))
        }
        .font(.system(size: 13, weight: .regular, design: .rounded))
        .foregroundStyle(.white.opacity(0.46))
        .padding(.horizontal, 4)
    }

    private var panelBackground: some View {
        RoundedRectangle(cornerRadius: 18, style: .continuous)
            .fill(Color.white.opacity(0.04))
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .stroke(Color.white.opacity(0.12), lineWidth: 1)
            )
    }

    private var background: some View {
        LinearGradient(
            colors: [
                Color(red: 0.03, green: 0.05, blue: 0.11),
                Color(red: 0.06, green: 0.05, blue: 0.13),
                Color(red: 0.03, green: 0.08, blue: 0.11),
                Color(red: 0.02, green: 0.03, blue: 0.05)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .overlay(
            RadialGradient(
                colors: [Color.white.opacity(0.07), .clear],
                center: .bottom,
                startRadius: 6,
                endRadius: 460
            )
        )
        .ignoresSafeArea()
    }
}

#Preview {
    MainAgentView()
}
