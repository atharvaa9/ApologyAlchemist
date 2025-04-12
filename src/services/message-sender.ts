/**
 * Represents a message to be sent, containing content and recipient information.
 */
export interface Message {
  /**
   * The content of the message.
   */
  content: string;
  /**
   * The recipient's identifier (e.g., phone number or email address).
   */
  recipient: string;
}

/**
 * Asynchronously sends a message to the specified recipient.
 *
 * @param message The message to send, including content and recipient information.
 * @returns A promise that resolves when the message is successfully sent.
 */
export async function sendMessage(message: Message): Promise<void> {
  // TODO: Implement this by calling an API.
  console.log(`Sending message to ${message.recipient}: ${message.content}`);
}
