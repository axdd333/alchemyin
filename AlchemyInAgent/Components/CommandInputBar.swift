import SwiftUI

struct CommandInputBar: View {
    @Binding var text: String
    let onSend: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            HStack(spacing: 10) {
                Circle()
                    .fill(Color.cyan)
                    .frame(width: 6, height: 6)

                TextField("Describe what you want the agent to do…", text: $text, axis: .vertical)
                    .textFieldStyle(.plain)
                    .foregroundStyle(.white.opacity(0.94))
                    .font(.system(size: 20, weight: .regular, design: .rounded))
                    .lineLimit(1...3)
                    .submitLabel(.send)
                    .onSubmit(onSend)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 14)

            Button(action: onSend) {
                Image(systemName: "paperplane")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(width: 46, height: 46)
                    .background(RoundedRectangle(cornerRadius: 14).fill(Color.white.opacity(0.1)))
            }
            .buttonStyle(.plain)
            .disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            .opacity(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? 0.45 : 1)
        }
        .padding(8)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(Color.black.opacity(0.32))
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .stroke(Color.white.opacity(0.18), lineWidth: 1)
                )
        )
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        CommandInputBar(text: .constant(""), onSend: {})
            .padding()
    }
}
