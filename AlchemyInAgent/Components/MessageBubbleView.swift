import SwiftUI

struct MessageBubbleView: View {
    let message: ChatMessage

    private var isAgent: Bool { message.role == .agent }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Capsule()
                    .fill(isAgent ? Color.cyan : Color.purple)
                    .frame(width: 20, height: 3)

                Text(message.role.rawValue)
                    .foregroundStyle(isAgent ? Color.cyan : Color.purple)
                    .font(.system(size: 12, weight: .semibold, design: .monospaced))

                Text(message.timestamp.formatted(date: .omitted, time: .shortened))
                    .foregroundStyle(.white.opacity(0.35))
                    .font(.system(size: 12, weight: .regular, design: .rounded))
            }

            Text(message.content)
                .foregroundStyle(.white.opacity(0.92))
                .font(.system(size: 16, weight: .regular, design: .rounded))
                .multilineTextAlignment(.leading)
                .lineSpacing(2)
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(Color.white.opacity(0.04))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .stroke((isAgent ? Color.cyan : Color.purple).opacity(0.25), lineWidth: 1)
                        )
                )
        }
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        MessageBubbleView(message: ChatMessage(role: .agent, content: "Streaming response preview text."))
            .padding()
    }
}
