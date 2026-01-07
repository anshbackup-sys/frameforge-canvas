import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "How do I choose the right frame size?",
      answer: "Measure your artwork or photo, then add 2-3 inches to each dimension if you want a mat border. Check our Size Guide for standard dimensions, or use our Custom Frame Builder for exact specifications."
    },
    {
      question: "What's the difference between glass and acrylic glazing?",
      answer: "Glass offers superior clarity and scratch resistance but is heavier and can break. Acrylic is lighter, shatter-resistant, and ideal for larger frames or shipping, though it may scratch more easily."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard orders ship within 1-2 business days and arrive in 3-5 business days. Custom frames take an additional 3-5 days for crafting. Express shipping options are available at checkout."
    },
    {
      question: "Can I return a custom frame?",
      answer: "Custom frames are made specifically for you, so they cannot be returned unless defective. However, we offer free design revisions before production to ensure you're completely satisfied."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we ship throughout India. International shipping is coming soon! Sign up for our newsletter to be notified when it's available."
    },
    {
      question: "How do I hang my frame properly?",
      answer: "Most frames include hanging hardware. For standard frames, use a single nail or hook. Larger frames may need two hooks or a French cleat system. Use a level for perfect alignment."
    },
    {
      question: "What if my frame arrives damaged?",
      answer: "Contact us within 48 hours with photos of the damage. We'll arrange a free replacement or full refund immediately. Your satisfaction is guaranteed."
    },
    {
      question: "Can I use my own glass or mat?",
      answer: "Our frames are designed with specific measurements for our materials. Using third-party components may affect fit and finish. Contact us for custom specifications."
    },
    {
      question: "How do I clean my frame?",
      answer: "Use a soft, dry microfiber cloth for regular dusting. For glass, use a non-ammonia cleaner sprayed on the cloth, not directly on the frame. See our Care Instructions for material-specific tips."
    },
    {
      question: "Do you offer bulk or wholesale pricing?",
      answer: "Yes! For orders of 10+ frames or business inquiries, contact our sales team at wholesale@kaiga.com for custom pricing and dedicated support."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-16 bg-gradient-to-br from-cosmic-black via-background to-cosmic-gray">
        <div className="container-wide text-center">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our products and services
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center p-8 bg-muted/30 rounded-lg">
            <h3 className="font-bold text-xl mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <a 
              href="/contact" 
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;