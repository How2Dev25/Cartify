"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  
  // Refs for animations
  const heroRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const valuesRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  
  // Individual element refs
  const statItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const valueItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const milestoneItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const testimonialItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    setIsVisible(true);
    
    // Hero section animations
    const heroTl = gsap.timeline();
    heroTl
      .fromTo(".hero-badge", 
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.2)" }
      )
      .fromTo(".hero-title", 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1, ease: "elastic.out(1, 0.5)" },
        "-=0.4"
      )
      .fromTo(".hero-subtitle", 
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      );
    
    // Animate stats with stagger and count-up
    statItemsRef.current.forEach((stat, index) => {
      if (!stat) return;
      
      const valueElement = stat.querySelector(".stat-value") as HTMLElement;
      const finalValue = valueElement?.getAttribute("data-value");
      
      gsap.fromTo(stat,
        { opacity: 0, y: 50, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: index * 0.15,
          scrollTrigger: {
            trigger: statsRef.current || undefined,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          onComplete: () => {
            if (valueElement && finalValue) {
              let start = 0;
              const end = parseInt(finalValue);
              const increment = end / 60;
              
              const updateCounter = () => {
                start += increment;
                if (start < end) {
                  let displayValue = Math.floor(start);
                  if (finalValue.includes("K+")) {
                    valueElement.textContent = displayValue + "K+";
                  } else if (finalValue.includes("+")) {
                    valueElement.textContent = displayValue + "+";
                  } else {
                    valueElement.textContent = displayValue.toString();
                  }
                  requestAnimationFrame(updateCounter);
                } else {
                  valueElement.textContent = finalValue;
                }
              };
              updateCounter();
            }
          }
        }
      );
    });
    
    // Story section animations
    if (storyRef.current) {
      gsap.fromTo(".story-content",
        { opacity: 0, x: -80, rotationY: -30 },
        {
          opacity: 1,
          x: 0,
          rotationY: 0,
          duration: 1,
          scrollTrigger: {
            trigger: storyRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );
      
      gsap.fromTo(".story-image",
        { opacity: 0, x: 80, rotationY: 30 },
        {
          opacity: 1,
          x: 0,
          rotationY: 0,
          duration: 1,
          scrollTrigger: {
            trigger: storyRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );
      
      gsap.fromTo(".rating-badge",
        { opacity: 0, scale: 0, rotation: -180 },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.8,
          delay: 0.5,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: storyRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
    
    // Values section animations
    valueItemsRef.current.forEach((item, index) => {
      if (!item) return;
      
      gsap.fromTo(item,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: index * 0.15,
          scrollTrigger: {
            trigger: valuesRef.current || undefined,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
          ease: "back.out(0.8)",
        }
      );
    });
    
    // Timeline animations
    milestoneItemsRef.current.forEach((item, index) => {
      if (!item) return;
      
      const isEven = index % 2 === 0;
      gsap.fromTo(item,
        { 
          opacity: 0, 
          x: isEven ? -100 : 100,
          rotationY: isEven ? -20 : 20
        },
        {
          opacity: 1,
          x: 0,
          rotationY: 0,
          duration: 0.8,
          delay: index * 0.2,
          scrollTrigger: {
            trigger: timelineRef.current || undefined,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
          ease: "power3.out",
        }
      );
    });
    
    // Animate timeline line
    if (timelineRef.current) {
      gsap.fromTo(".timeline-line",
        { height: 0 },
        {
          height: "100%",
          duration: 1.5,
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 70%",
            end: "bottom 30%",
            scrub: 1,
          },
        }
      );
    }
    
    // Testimonials animations
    testimonialItemsRef.current.forEach((item, index) => {
      if (!item) return;
      
      gsap.fromTo(item,
        { opacity: 0, scale: 0.8, rotateY: 30 },
        {
          opacity: 1,
          scale: 1,
          rotateY: 0,
          duration: 0.7,
          delay: index * 0.2,
          scrollTrigger: {
            trigger: testimonialsRef.current || undefined,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
          ease: "back.out(1.2)",
        }
      );
    });
    
    // Parallax effect on hero background
    if (heroRef.current) {
      gsap.to(".hero-blur", {
        y: 100,
        duration: 1,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }
    
    // CTA section animations
    if (ctaRef.current) {
      gsap.fromTo(".cta-content",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          ease: "elastic.out(1, 0.5)",
        }
      );
    }
    
    // Cleanup ScrollTrigger
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  
  const stats = [
    { value: "50K+", label: "Happy Customers" },
    { value: "500+", label: "Products" },
    { value: "30+", label: "Countries" },
    { value: "24/7", label: "Customer Support" }
  ];

  const values = [
    {
      icon: "✨",
      title: "Quality First",
      description: "We partner with premium brands and carefully curate every product in our collection."
    },
    {
      icon: "🚀",
      title: "Fast Shipping",
      description: "Same-day dispatch and free express shipping on orders over $50."
    },
    {
      icon: "💚",
      title: "Sustainable",
      description: "Committed to eco-friendly packaging and sustainable business practices."
    },
    {
      icon: "🎯",
      title: "Customer Focus",
      description: "Your satisfaction is our priority with easy returns and 24/7 support."
    }
  ];

  const milestones = [
    { year: "2020", title: "Founded", description: "Cartify launched with a mission to revolutionize online shopping" },
    { year: "2021", title: "10K Customers", description: "Reached our first 10,000 happy customers milestone" },
    { year: "2022", title: "Global Expansion", description: "Expanded shipping to over 30 countries worldwide" },
    { year: "2023", title: "Award Winning", description: "Recognized as 'Best E-Commerce Platform' by Tech Weekly" },
    { year: "2024", title: "1M Orders", description: "Celebrated over 1 million successful deliveries" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fashion Blogger",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      quote: "Cartify has completely changed how I shop online. The quality and service are unmatched!"
    },
    {
      name: "Michael Chen",
      role: "Verified Buyer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      quote: "Fast shipping, great prices, and amazing customer support. Highly recommend!"
    },
    {
      name: "Emma Rodriguez",
      role: "Frequent Shopper",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      quote: "Best online shopping experience I've ever had. Will definitely shop again!"
    }
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Hero Section */}
      <section ref={heroRef} className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="hero-blur absolute top-20 right-20 w-72 h-72 bg-orange-500 rounded-full filter blur-3xl"></div>
          <div className="hero-blur absolute bottom-20 left-20 w-72 h-72 bg-orange-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="hero-badge opacity-0">
              <span className="inline-block bg-orange-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-orange-400 text-sm font-semibold mb-6">
                Our Story
              </span>
            </div>
            
            <h1 className="hero-title opacity-0 text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              More Than Just 
              <span className="text-orange-500 block mt-2">A Shopping Destination</span>
            </h1>
            
            <p className="hero-subtitle opacity-0 text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Cartify was born from a simple idea — to create the best online shopping experience 
              where quality meets affordability, and customer satisfaction comes first.
            </p>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path fill="#f9fafb" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                ref={el => { statItemsRef.current[index] = el; }}
                className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 opacity-0"
              >
                <div className="stat-value text-3xl md:text-4xl font-bold text-orange-500 mb-2" data-value={stat.value}>
                  0
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section ref={storyRef} className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="story-content opacity-0">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Our <span className="text-orange-500">Journey</span>
              </h2>
              <div className="w-20 h-1 bg-orange-500 mb-6 rounded-full"></div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Founded in 2020, Cartify started as a small team of passionate individuals who believed 
                that online shopping should be exciting, trustworthy, and hassle-free. What began as a 
                vision has now grown into a thriving e-commerce platform serving thousands of customers worldwide.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We carefully curate our product selection, partnering with trusted brands and artisans 
                to bring you the best quality items at competitive prices. Every product on Cartify 
                goes through a rigorous quality check before reaching our virtual shelves.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we're proud to be one of the fastest-growing online retailers, but our mission 
                remains the same — to make every customer's shopping experience memorable and delightful.
              </p>
            </div>
            <div className="relative">
              <div className="story-image opacity-0">
                <img 
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=500&fit=crop"
                  alt="Cartify Store"
                  className="rounded-2xl shadow-2xl w-full"
                />
              </div>
              <div className="rating-badge absolute -bottom-5 -right-5 bg-orange-500 rounded-xl p-4 shadow-lg opacity-0">
                <div className="text-white text-center">
                  <div className="text-2xl font-bold">4.8</div>
                  <div className="text-sm">★★★★☆</div>
                  <div className="text-xs">Customer Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section ref={valuesRef} className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              What <span className="text-orange-500">Drives Us</span>
            </h2>
            <div className="w-20 h-1 bg-orange-500 mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Our core values guide everything we do at Cartify
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                ref={el => { valueItemsRef.current[index] = el; }}
                className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 opacity-0"
              >
                <div className="text-5xl mb-4 float-animation">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section ref={timelineRef} className="py-16 md:py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Our <span className="text-orange-500">Milestones</span>
            </h2>
            <div className="w-20 h-1 bg-orange-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="relative">
            <div className="timeline-line absolute left-1/2 transform -translate-x-1/2 w-1 bg-orange-200 h-0 hidden md:block"></div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div 
                  key={index} 
                  ref={el => { milestoneItemsRef.current[index] = el; }}
                  className={`flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center opacity-0`}
                >
                  <div className="md:w-1/2 p-4">
                    <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all transform hover:scale-105 duration-300">
                      <div className="text-orange-500 font-bold text-xl mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="md:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="py-16 md:py-24 bg-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              What Our <span className="text-orange-500">Customers Say</span>
            </h2>
            <div className="w-20 h-1 bg-orange-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                ref={el => { testimonialItemsRef.current[index] = el; }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all opacity-0 hover:-translate-y-2 duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-orange-500">{testimonial.role}</div>
                  </div>
                </div>
                <div className="text-yellow-400 mb-3">★★★★★</div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-16 md:py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="cta-content container mx-auto px-4 text-center opacity-0">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience Cartify?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of happy customers and discover the best online shopping experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products" 
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:scale-105 transform duration-300"
            >
              Shop Now
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 rounded-full font-semibold transition-all hover:scale-105 transform duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}