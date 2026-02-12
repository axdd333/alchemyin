import SwiftUI

struct MessageBubbleView: View {
    let message: ChatMessage
    var isEphemeral: Bool = false

    private var isAgent: Bool { message.role == .agent }

    var body: some View {
        VStack(alignment: .leading, spacing: isEphemeral ? 6 : 8) {
            HStack(spacing: 8) {
                Capsule()
                    .fill(isAgent ? Color.cyan : Color.purple)
                    .frame(width: isEphemeral ? 14 : 20, height: 3)

                Text(message.role.rawValue)
                    .foregroundStyle(isAgent ? Color.cyan : Color.purple)
                    .font(.system(size: isEphemeral ? 11 : 12, weight: .semibold, design: .monospaced))

                Text(message.timestamp.formatted(date: .omitted, time: .shortened))
                    .foregroundStyle(.white.opacity(0.35))
                    .font(.system(size: 12, weight: .regular, design: .rounded))
            }

            Text(message.content)
                .foregroundStyle(.white.opacity(isEphemeral ? 0.78 : 0.92))
                .font(.system(size: isEphemeral ? 14 : 16, weight: .regular, design: .rounded))
                .multilineTextAlignment(.leading)
                .lineSpacing(2)
                .padding(.horizontal, isEphemeral ? 10 : 12)
                .padding(.vertical, isEphemeral ? 8 : 10)
                .background(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(Color.white.opacity(isEphemeral ? 0.025 : 0.04))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .stroke((isAgent ? Color.cyan : Color.purple).opacity(isEphemeral ? 0.16 : 0.25), lineWidth: 1)
                        )
                )
        }
        .opacity(isEphemeral ? 0.78 : 1)
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        MessageBubbleView(message: ChatMessage(role: .agent, content: "Streaming response preview text."), isEphemeral: true)
            .padding()
    }
}
