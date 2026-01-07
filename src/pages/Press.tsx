import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Calendar, ExternalLink } from "lucide-react";

const Press = () => {
  const pressItems = [
    {
      publication: "Architectural Digest India",
      title: "The Rise of Cosmic-Themed Home Decor",
      date: "December 2024",
      excerpt: "Kaiga's innovative approach to framing has redefined how we think about displaying our memories...",
      featured: true,
    },
    {
      publication: "The Hindu Business Line",
      title: "Startup Spotlight: Kaiga's Journey from Workshop to Empire",
      date: "October 2024",
      excerpt: "From a three-person workshop in Mumbai to serving over 50,000 customers nationwide...",
      featured: true,
    },
    {
      publication: "Elle Decor",
      title: "10 Frame Brands That Are Changing the Game",
      date: "August 2024",
      excerpt: "Kaiga stands out with their distinctive black and white aesthetic inspired by the cosmos...",
      featured: false,
    },
    {
      publication: "Better Homes & Gardens India",
      title: "How to Create the Perfect Gallery Wall",
      date: "June 2024",
      excerpt: "Expert tips from Kaiga's design team on curating a stunning gallery wall display...",
      featured: false,
    },
    {
      publication: "Forbes India",
      title: "D2C Brands Redefining Indian E-commerce",
      date: "April 2024",
      excerpt: "Kaiga's direct-to-consumer model and focus on customization sets a new standard...",
      featured: true,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-16 bg-gradient-to-br from-cosmic-black via-background to-cosmic-gray">
        <div className="container-wide text-center">
          <Newspaper className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Press & Media</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kaiga in the news—what the world is saying about our cosmic frames
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {pressItems.filter(item => item.featured).map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">{item.publication}</Badge>
                    {item.featured && <Badge>Featured</Badge>}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{item.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {item.date}
                    </span>
                    <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                      Read More <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-6">More Coverage</h2>
          <div className="space-y-4">
            {pressItems.filter(item => !item.featured).map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{item.publication}</Badge>
                    <span className="font-medium">{item.title}</span>
                    <span className="text-sm text-muted-foreground hidden md:inline">
                      {item.date}
                    </span>
                  </div>
                  <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                    Read <ExternalLink className="h-3 w-3" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-8 bg-muted/30 rounded-lg text-center">
            <h3 className="font-bold text-xl mb-2">Media Inquiries</h3>
            <p className="text-muted-foreground mb-4">
              For press inquiries, interviews, or media kit requests, please contact:
            </p>
            <a 
              href="mailto:press@kaiga.com" 
              className="text-primary font-medium hover:underline"
            >
              press@kaiga.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Press;