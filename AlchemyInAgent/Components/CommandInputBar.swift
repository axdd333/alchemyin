import SwiftUI

struct CommandInputBar: View {
    @Binding var text: String
    let onSend: () -> Void

    var body: some View {
        HStack(spacing: 10) {
            HStack(spacing: 10) {
                Circle()
                    .fill(Color(red: 0.74, green: 0.66, blue: 0.46))
                    .frame(width: 6, height: 6)

                TextField("Describe what you want the operator to do…", text: $text, axis: .vertical)
                    .textFieldStyle(.plain)
                    .font(.system(size: 16, weight: .regular, design: .rounded))
                    .foregroundStyle(.white.opacity(0.9))
                    .lineLimit(1...3)
                    .submitLabel(.send)
                    .onSubmit(onSend)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)

            Button(action: onSend) {
                Image(systemName: "paperplane")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(width: 44, height: 44)
                    .background(Circle().fill(Color.white.opacity(0.08)))
            }
            .buttonStyle(.plain)
            .disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            .opacity(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? 0.45 : 1)
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
