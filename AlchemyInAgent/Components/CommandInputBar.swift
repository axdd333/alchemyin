import SwiftUI

struct CommandInputBar: View {
    @Binding var text: String
    let onSend: () -> Void

    private var isEmpty: Bool {
        text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var body: some View {
        HStack(spacing: 10) {
            HStack(spacing: 10) {
                Circle()
                    .fill(Color(red: 0.72, green: 0.68, blue: 0.48))
                    .frame(width: 7, height: 7)

                TextField("Issue a desktop objective for the operator…", text: $text, axis: .vertical)
                    .textFieldStyle(.plain)
                    .font(.system(size: 15, weight: .regular, design: .rounded))
                    .foregroundStyle(.white.opacity(0.9))
                    .lineLimit(1...3)
                    .submitLabel(.send)
                    .onSubmit(onSend)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)

            Button(action: onSend) {
                Image(systemName: "paperplane.fill")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.white.opacity(isEmpty ? 0.58 : 1))
                    .frame(width: 42, height: 42)
                    .background(Circle().fill(Color.white.opacity(isEmpty ? 0.06 : 0.12)))
            }
            .buttonStyle(.plain)
            .disabled(isEmpty)
        }
        .padding(6)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(Color.white.opacity(0.03))
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .stroke(Color(red: 0.58, green: 0.50, blue: 0.35).opacity(0.24), lineWidth: 1)
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
