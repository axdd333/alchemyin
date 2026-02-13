import SwiftUI

struct AgentStatusHeader: View {
    let title: String
    let state: AgentState
    let latencyMs: Int
    let fpsLabel: String

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.system(size: 36, weight: .medium, design: .serif))
                        .foregroundStyle(Color(red: 0.95, green: 0.92, blue: 0.86))
                    Text("A contemplative AI workspace")
                        .font(.system(size: 13, weight: .medium, design: .rounded))
                        .foregroundStyle(.white.opacity(0.48))
                }

                Spacer()

                AnimatedStatusBadge(state: state)
            }

            HStack(spacing: 10) {
                metricPill("Latency", "\(latencyMs)ms")
                metricPill("FPS", fpsLabel)
                Spacer()
            }
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Color.white.opacity(0.04))
                .overlay(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .stroke(Color(red: 0.60, green: 0.53, blue: 0.37).opacity(0.25), lineWidth: 1)
                )
        )
    }

    private func metricPill(_ label: String, _ value: String) -> some View {
        HStack(spacing: 6) {
            Text(label)
                .foregroundStyle(.white.opacity(0.64))
            Text(value)
                .foregroundStyle(Color(red: 0.76, green: 0.67, blue: 0.48))
                .fontWeight(.semibold)
        }
        .font(.system(size: 13, weight: .regular, design: .monospaced))
        .padding(.vertical, 7)
        .padding(.horizontal, 11)
        .background(Capsule().fill(Color.black.opacity(0.22)))
    }
}

#Preview {
    AgentStatusHeader(title: "Alchemy Agent", state: .ready, latencyMs: 11, fpsLabel: "60 FPS")
        .padding()
        .background(.black)
}
