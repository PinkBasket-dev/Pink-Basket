import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {

  const phoneNumber = "+26659022248"; 
  const message = "Hi Pink Basket, I have a question about my order.";
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
      title="Chat on WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}