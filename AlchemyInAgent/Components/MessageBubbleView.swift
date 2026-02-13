import SwiftUI

struct MessageBubbleView: View {
    let message: ChatMessage
    var isEphemeral: Bool = false

    private var isAgent: Bool { message.role == .agent }
    private var accent: Color {
        isAgent ? Color(red: 0.71, green: 0.80, blue: 0.92) : Color(red: 0.80, green: 0.67, blue: 0.47)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                Capsule().fill(accent).frame(width: 18, height: 2.5)

                Text(message.role.rawValue)
                    .foregroundStyle(accent)
                    .font(.system(size: 11, weight: .semibold, design: .monospaced))

                Text(message.timestamp.formatted(date: .omitted, time: .shortened))
                    .foregroundStyle(.white.opacity(0.35))
                    .font(.system(size: 11, weight: .regular, design: .rounded))
            }

            Text(message.content)
                .foregroundStyle(.white.opacity(isEphemeral ? 0.76 : 0.9))
                .font(.system(size: isEphemeral ? 14 : 15, weight: .regular, design: .rounded))
                .lineSpacing(2)
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(Color.white.opacity(isEphemeral ? 0.025 : 0.04))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(accent.opacity(isEphemeral ? 0.16 : 0.26), lineWidth: 1)
                        )
                )
        }
        .opacity(isEphemeral ? 0.78 : 1)
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        MessageBubbleView(message: ChatMessage(role: .agent, content: "A refined message style for preview."), isEphemeral: true)
            .padding()
    }
}
