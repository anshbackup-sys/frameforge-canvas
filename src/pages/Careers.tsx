import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Clock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Careers = () => {
  const openPositions = [
    {
      title: "Senior Frame Designer",
      department: "Design",
      location: "Mumbai",
      type: "Full-time",
      description: "Create innovative frame designs that push the boundaries of our cosmic aesthetic.",
    },
    {
      title: "E-commerce Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      description: "Drive online sales growth and optimize the customer shopping experience.",
    },
    {
      title: "Master Craftsman",
      department: "Production",
      location: "Mumbai",
      type: "Full-time",
      description: "Lead our team of artisans in creating premium handcrafted frames.",
    },
    {
      title: "Customer Experience Specialist",
      department: "Support",
      location: "Hybrid",
      type: "Full-time",
      description: "Ensure every customer interaction reflects our commitment to excellence.",
    },
  ];

  const benefits = [
    "Competitive salary & annual bonuses",
    "Health insurance for you & family",
    "Flexible work arrangements",
    "Professional development budget",
    "Employee discount on all products",
    "Team events & celebrations",
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-16 bg-gradient-to-br from-cosmic-black via-background to-cosmic-gray">
        <div className="container-wide text-center">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Join Our Cosmic Team</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Help us transform memories into masterpieces. We're always looking for 
            passionate people to join our journey.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
              <div className="space-y-4">
                {openPositions.map((position, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">{position.title}</h3>
                            <Badge variant="secondary">{position.department}</Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{position.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {position.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {position.type}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 p-6 bg-muted/30 rounded-lg">
                <h3 className="font-bold mb-2">Don't see a role that fits?</h3>
                <p className="text-muted-foreground mb-4">
                  We're always interested in meeting talented people. Send your resume 
                  and tell us how you'd like to contribute to our cosmic mission.
                </p>
                <a 
                  href="mailto:careers@kaiga.com" 
                  className="text-primary font-medium hover:underline"
                >
                  careers@kaiga.com
                </a>
              </div>
            </div>

            <div>
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Why Join Kaiga?</h3>
                  <ul className="space-y-3">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-bold mb-4">Life at Kaiga</h2>
          <p className="max-w-2xl mx-auto mb-8 opacity-90">
            We're a team of passionate creators, craftspeople, and problem-solvers 
            united by our love for beautiful frames and exceptional customer experiences.
          </p>
          <Button variant="secondary" asChild>
            <Link to="/about">Learn More About Us</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;