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

    private let ambientNodes: [AmbientNode] = [
        .init(x: 0.06, y: 0.12, radius: 1.7, speed: 0.5, hue: 0.52),
        .init(x: 0.18, y: 0.34, radius: 2.8, speed: 0.7, hue: 0.54),
        .init(x: 0.34, y: 0.16, radius: 2.2, speed: 0.6, hue: 0.44),
        .init(x: 0.47, y: 0.38, radius: 2.6, speed: 0.8, hue: 0.58),
        .init(x: 0.58, y: 0.21, radius: 3.1, speed: 0.9, hue: 0.62),
        .init(x: 0.71, y: 0.29, radius: 2.0, speed: 0.65, hue: 0.53),
        .init(x: 0.82, y: 0.14, radius: 2.4, speed: 0.55, hue: 0.49),
        .init(x: 0.88, y: 0.42, radius: 3.4, speed: 0.75, hue: 0.57),
        .init(x: 0.24, y: 0.62, radius: 2.1, speed: 0.62, hue: 0.61),
        .init(x: 0.42, y: 0.74, radius: 2.9, speed: 0.72, hue: 0.47),
        .init(x: 0.64, y: 0.68, radius: 2.0, speed: 0.56, hue: 0.52),
        .init(x: 0.79, y: 0.78, radius: 2.7, speed: 0.84, hue: 0.59)
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

    private var processingIntensity: CGFloat {
        viewModel.agentState == .processing ? 1 : 0.35
    }

    var body: some View {
        ZStack {
            background

            VStack(spacing: 12) {
                topBar
                runtimeTelemetryStrip

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

    private var runtimeTelemetryStrip: some View {
        HStack(spacing: 9) {
            telemetryBadge(
                title: "Pulse",
                value: viewModel.agentState == .processing ? "Live" : "Steady",
                tint: Color(red: 0.50, green: 0.83, blue: 0.85)
            )
            telemetryBadge(
                title: "Queue",
                value: "\(max(0, viewModel.messages.count - 1))",
                tint: Color(red: 0.89, green: 0.73, blue: 0.54)
            )
            telemetryBadge(
                title: "Sync",
                value: viewModel.isConnected ? "Secure" : "Offline",
                tint: Color(red: 0.73, green: 0.80, blue: 0.94)
            )
        }
    }

    private func telemetryBadge(title: String, value: String, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.system(size: 10, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.44))
            Text(value)
                .font(.system(size: 12, weight: .semibold, design: .rounded))
                .foregroundStyle(tint)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(Color.white.opacity(0.04))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(tint.opacity(0.18), lineWidth: 1)
                )
        )
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
                .overlay {
                    TimelineView(.animation(minimumInterval: 1 / 30)) { timeline in
                        Canvas { context, size in
                            drawAmbientMesh(context: &context, size: size, date: timeline.date)
                        }
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .opacity(0.9)
                    .blendMode(.screen)
                }
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
        ZStack {
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

            TimelineView(.animation(minimumInterval: 1 / 24)) { timeline in
                Canvas { context, size in
                    drawAmbientMesh(context: &context, size: size, date: timeline.date)
                }
                .opacity(0.66 * processingIntensity)
                .blendMode(.plusLighter)
            }

            RadialGradient(
                colors: [Color.white.opacity(0.07), .clear],
                center: .bottom,
                startRadius: 6,
                endRadius: 460
            )
        }
        .ignoresSafeArea()
    }

    private func drawAmbientMesh(context: inout GraphicsContext, size: CGSize, date: Date) {
        let t = date.timeIntervalSinceReferenceDate
        let points = ambientNodes.map { node in
            CGPoint(
                x: node.x * size.width + sin(t * node.speed + node.phase) * 10,
                y: node.y * size.height + cos(t * (node.speed + 0.14) + node.phase) * 8
            )
        }

        for (index, point) in points.enumerated() {
            for candidate in (index + 1)..<points.count {
                let neighbor = points[candidate]
                let distance = hypot(point.x - neighbor.x, point.y - neighbor.y)
                guard distance < 140 else { continue }
                var path = Path()
                path.move(to: point)
                path.addLine(to: neighbor)
                let alpha = max(0.04, 0.20 - (distance / 900))
                context.stroke(path, with: .color(Color.white.opacity(alpha * processingIntensity)), lineWidth: 0.75)
            }
        }

        for (index, point) in points.enumerated() {
            let node = ambientNodes[index]
            let nodeColor = Color(hue: node.hue, saturation: 0.42, brightness: 0.92)
            let radius = node.radius + CGFloat((sin(t * node.speed + node.phase) + 1) * 0.7)
            let rect = CGRect(x: point.x - radius, y: point.y - radius, width: radius * 2, height: radius * 2)
            context.fill(Path(ellipseIn: rect), with: .color(nodeColor.opacity(0.9)))
        }
    }
}

private struct AmbientNode {
    let x: CGFloat
    let y: CGFloat
    let radius: CGFloat
    let speed: Double
    let hue: Double
    let phase: Double

    init(x: CGFloat, y: CGFloat, radius: CGFloat, speed: Double, hue: Double) {
        self.x = x
        self.y = y
        self.radius = radius
        self.speed = speed
        self.hue = hue
        self.phase = (x + y) * 4.4
    }
}

#Preview {
    MainAgentView()
}
