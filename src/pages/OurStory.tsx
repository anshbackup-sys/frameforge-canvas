import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, Target, Heart, Star, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const OurStory = () => {
  const timeline = [
    { year: "2009", title: "The Beginning", description: "Kaiga started as a small workshop with a passion for preserving memories through beautiful frames." },
    { year: "2012", title: "First Showroom", description: "Opened our first retail showroom in Mumbai, bringing cosmic-themed frames to discerning customers." },
    { year: "2016", title: "Online Launch", description: "Launched our e-commerce platform, making premium frames accessible across India." },
    { year: "2020", title: "Custom Builder", description: "Introduced our revolutionary Custom Frame Builder for personalized creations." },
    { year: "2024", title: "Today", description: "Serving 50,000+ happy customers with our expanding collection of cosmic-inspired frames." },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-16 bg-gradient-to-br from-cosmic-black via-background to-cosmic-gray">
        <div className="container-wide text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">Our Journey</Badge>
          <h1 className="text-4xl font-bold mb-4">Our Story</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From a small workshop to India's premier cosmic-themed framing studio
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">Where It All Began</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Kaiga was born in 2009 from a simple observation: while memories are priceless, 
                  the frames that house them often felt ordinary and uninspiring. Our founder, 
                  an astrophysics enthusiast and craftsman, envisioned frames that captured the 
                  mystery and elegance of the cosmos.
                </p>
                <p>
                  Starting with just three artisans in a small Mumbai workshop, we began 
                  crafting frames that weren't just containers for photos—they were works 
                  of art themselves. Our signature black and white aesthetic, inspired by 
                  the infinite beauty of space, quickly gained recognition.
                </p>
                <p>
                  Today, Kaiga has grown into a team of over 50 dedicated craftspeople, 
                  designers, and customer service specialists, all united by our mission 
                  to transform memories into cosmic masterpieces.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/placeholder.svg" 
                alt="Kaiga workshop"
                className="rounded-lg shadow-cosmic w-full h-80 object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-lg">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm">Years of Excellence</div>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Journey</h2>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-border" />
              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <div key={item.year} className={`flex items-center gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-1/2 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className="text-2xl font-bold text-primary mb-2">{item.year}</div>
                      <div className="font-semibold text-lg mb-1">{item.title}</div>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="w-4 h-4 bg-primary rounded-full z-10" />
                    <div className="w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-10 w-10 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold mb-1">50+</div>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Award className="h-10 w-10 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold mb-1">12</div>
                <p className="text-sm text-muted-foreground">Design Awards</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Star className="h-10 w-10 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold mb-1">50K+</div>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Sparkles className="h-10 w-10 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold mb-1">100K+</div>
                <p className="text-sm text-muted-foreground">Frames Crafted</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OurStory;