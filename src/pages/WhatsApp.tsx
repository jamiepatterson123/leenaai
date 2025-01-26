import { WhatsAppPreferences } from "@/components/whatsapp/WhatsAppPreferences";

const WhatsApp = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">WhatsApp Settings</h1>
        <WhatsAppPreferences />
      </div>
    </div>
  );
};

export default WhatsApp;