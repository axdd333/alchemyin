import SwiftUI

struct AgentStatusHeader: View {
    let title: String
    let state: AgentState
    let latencyMs: Int
    let fpsLabel: String

    var body: some View {
        VStack(spacing: 12) {
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.system(size: 26, weight: .semibold, design: .rounded))
                        .foregroundStyle(.white.opacity(0.95))

                    Text("Realtime AI workspace")
                        .font(.system(size: 13, weight: .medium, design: .rounded))
                        .foregroundStyle(.white.opacity(0.45))
                }

                Spacer()

                AnimatedStatusBadge(state: state)
            }

            HStack(spacing: 10) {
                metricCapsule(title: "Latency", value: "\(latencyMs)ms", tint: .cyan)
                metricCapsule(title: "FPS", value: fpsLabel, tint: .green)
                Spacer()
            }
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            Color(red: 0.12, green: 0.10, blue: 0.24).opacity(0.95),
                            Color(red: 0.04, green: 0.05, blue: 0.12).opacity(0.9)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .stroke(Color.white.opacity(0.12), lineWidth: 1)
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
        .font(.system(size: 13, weight: .regular, design: .monospaced))
        .padding(.vertical, 6)
        .padding(.horizontal, 10)
        .background(
            Capsule()
                .fill(Color.black.opacity(0.35))
                .overlay(Capsule().stroke(tint.opacity(0.28), lineWidth: 1))
        )
    }
}

#Preview {
    AgentStatusHeader(title: "Alchemy Agent", state: .processing, latencyMs: 14, fpsLabel: "60 FPS")
        .padding()
        .background(.black)
}
