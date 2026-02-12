import SwiftUI

struct AgentStatusHeader: View {
    let title: String
    let state: AgentState
    let latencyMs: Int
    let fpsLabel: String

    var body: some View {
        VStack(spacing: 12) {
            HStack(alignment: .center) {
                Label(title, systemImage: "desktopcomputer")
                    .font(.system(size: 30, weight: .semibold, design: .rounded))
                    .foregroundStyle(.white.opacity(0.92))

                Spacer()

                AnimatedStatusBadge(state: state)
            }

            HStack(spacing: 12) {
                metricCapsule(title: "Latency", value: "\(latencyMs)ms", tint: .cyan)
                metricCapsule(title: "FPS", value: fpsLabel, tint: .green)
                Spacer()
            }

            HStack(spacing: 8) {
                Circle()
                    .fill(state.accentColor)
                    .frame(width: 9, height: 9)
                Text("Agent Status:")
                    .foregroundStyle(.white.opacity(0.65))
                Text(state.statusText)
                    .foregroundStyle(state.accentColor)
                    .fontWeight(.medium)
                Spacer()
            }
            .font(.system(size: 18, weight: .regular, design: .rounded))
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            Color(red: 0.18, green: 0.11, blue: 0.33).opacity(0.95),
                            Color(red: 0.05, green: 0.05, blue: 0.12).opacity(0.9)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .stroke(Color.cyan.opacity(0.18), lineWidth: 1)
                )
        )
    }

    private func metricCapsule(title: String, value: String, tint: Color) -> some View {
        HStack(spacing: 6) {
            Text(title)
                .foregroundStyle(.white.opacity(0.7))
            Text(value)
                .foregroundStyle(tint)
                .fontWeight(.semibold)
        }
        .font(.system(size: 16, weight: .regular, design: .monospaced))
        .padding(.vertical, 8)
        .padding(.horizontal, 12)
        .background(
            Capsule()
                .fill(Color.black.opacity(0.35))
                .overlay(Capsule().stroke(tint.opacity(0.2), lineWidth: 1))
        )
    }
}

#Preview {
    AgentStatusHeader(title: "Agent Vision", state: .processing, latencyMs: 14, fpsLabel: "60 FPS")
        .padding()
        .background(.black)
}
