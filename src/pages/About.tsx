import { Users, Award, Target, Zap, Star, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Precision Craftsmanship",
      description: "Every frame is meticulously crafted with attention to the smallest details, ensuring cosmic-level quality."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We push the boundaries of traditional framing with cutting-edge materials and cosmic-inspired designs."
    },
    {
      icon: Heart,
      title: "Customer-Centric",
      description: "Your memories deserve the best protection and presentation - that's our cosmic promise."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Award-winning designs that have redefined the framing industry with our cosmic aesthetic."
    }
  ];

  const team = [
    {
      name: "Arjun Sharma",
      role: "Founder & CEO",
      description: "Visionary behind Kaiga's cosmic aesthetic with 15+ years in premium framing.",
      image: "/placeholder.svg"
    },
    {
      name: "Priya Patel",
      role: "Head of Design",
      description: "Creative genius who transforms cosmic concepts into stunning frame designs.",
      image: "/placeholder.svg"
    },
    {
      name: "Ravi Kumar",
      role: "Master Craftsman",
      description: "Artisan with 20+ years experience in handcrafting premium frames.",
      image: "/placeholder.svg"
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "100K+", label: "Frames Crafted" },
    { number: "15+", label: "Years Experience" },
    { number: "99.8%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-cosmic-black via-background to-cosmic-gray text-center overflow-hidden">
        {/* Cosmic Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cosmic-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cosmic-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="container-wide relative z-10">
          <Badge className="mb-6 bg-cosmic-black text-cosmic-white border-cosmic-border">
            Est. 2009
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cosmic-black to-cosmic-black/70 bg-clip-text">
            Crafting Cosmic Memories
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Born from a passion for preserving precious moments, Kaiga has been transforming 
            memories into cosmic masterpieces for over a decade. We believe every photo 
            deserves a frame as unique as the moment it captures.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-cosmic-gray/30">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Cosmic Journey</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Kaiga began in 2009 with a simple yet profound vision: to create frames 
                  that don't just hold pictures, but elevate them into cosmic art pieces. 
                  Our founder, inspired by the infinite beauty of the cosmos, set out to 
                  revolutionize the framing industry.
                </p>
                <p>
                  What started as a small workshop has grown into India's premier cosmic-themed 
                  framing studio. Our signature black and white aesthetic, combined with 
                  space-age materials and precision craftsmanship, has made us the go-to 
                  choice for discerning customers who demand excellence.
                </p>
                <p>
                  Today, we continue to push boundaries, combining traditional handcrafted 
                  techniques with innovative cosmic designs that capture the mystery and 
                  beauty of the universe.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/placeholder.svg" 
                alt="Kaiga workshop"
                className="rounded-lg shadow-cosmic w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cosmic-black/50 to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cosmic-black to-cosmic-black/70 bg-clip-text">
                  {stat.number}
                </div>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-cosmic-gray/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Cosmic Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do, from design to delivery
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 border-cosmic-border hover:shadow-cosmic transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-cosmic-black rounded-lg flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-cosmic-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Cosmic Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The passionate individuals behind every cosmic creation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center overflow-hidden border-cosmic-border hover:shadow-cosmic transition-all duration-300">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-gradient-to-r from-cosmic-black to-cosmic-black/90 text-cosmic-white">
        <div className="container-wide text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Our Cosmic Mission
            </h2>
            <p className="text-xl opacity-90 leading-relaxed mb-8">
              "To transform every precious memory into a cosmic masterpiece, 
              using the finest materials and craftsmanship to create frames 
              that transcend ordinary and touch the extraordinary."
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-lg opacity-80">Trusted by 50,000+ customers</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;