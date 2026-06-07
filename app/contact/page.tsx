"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Refs for animations
  const heroRef = useRef<HTMLDivElement>(null);
  const contactInfoRef = useRef<HTMLDivElement>(null);
  const contactFormRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  
  const infoItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const faqItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
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
    
    // Contact info animations
    infoItemsRef.current.forEach((item, index) => {
      if (!item) return;
      
      gsap.fromTo(item,
        { opacity: 0, x: -50, rotationY: -20 },
        {
          opacity: 1,
          x: 0,
          rotationY: 0,
          duration: 0.6,
          delay: index * 0.15,
          scrollTrigger: {
            trigger: contactInfoRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          ease: "back.out(0.8)",
        }
      );
    });
    
    // Contact form animations
    gsap.fromTo(".form-container",
      { opacity: 0, x: 50, rotationY: 20 },
      {
        opacity: 1,
        x: 0,
        rotationY: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: contactFormRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        ease: "back.out(0.8)",
      }
    );
    
    // Map section animation
    gsap.fromTo(".map-container",
      { opacity: 0, scale: 0.9, y: 50 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: mapRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        ease: "power3.out",
      }
    );
    
    // FAQ animations
    faqItemsRef.current.forEach((item, index) => {
      if (!item) return;
      
      gsap.fromTo(item,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: faqRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          ease: "power2.out",
        }
      );
    });
    
    // Parallax effect on hero background
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
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: "📍",
      title: "Visit Us",
      details: ["SM Fairview", "Quirino Highway corner", "Regalado Avenue, Quezon City", "Metro Manila, Philippines"]
    },
    {
      icon: "📞",
      title: "Call Us",
      details: ["+63 (2) 8123 4567", "+63 912 345 6789", "Mon-Sat, 10am-8pm PHT"]
    },
    {
      icon: "✉️",
      title: "Email Us",
      details: ["support@cartify.com", "hello@cartify.com", "24-48 hour response time"]
    },
    {
      icon: "💬",
      title: "Live Chat",
      details: ["Available 24/7", "Average wait: 2 mins", "Click the chat icon below"]
    }
  ];

  const faqs = [
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days within Metro Manila, and 5-7 business days for provincial areas. Express shipping takes 1-2 business days."
    },
    {
      question: "What is your return policy?",
      answer: "We offer 30-day returns for unused items in original packaging. Return shipping is free for all orders over ₱2,500."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to select countries. Shipping costs and delivery times vary by location. Contact our support for more details."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order in your account dashboard."
    },
    {
      question: "Are my payments secure?",
      answer: "Absolutely! We use industry-standard SSL encryption and accept major credit cards, GCash, and PayPal."
    }
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // SM Fairview coordinates
  const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.512906735287!2d121.058263314842!3d14.704918089733897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b12003b2e0b9%3A0x2b8e8b8e8b8e8b8e!2sSM%20City%20Fairview!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph";

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        .pulse-animation {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="hero-blur absolute top-20 right-20 w-72 h-72 bg-orange-500 rounded-full filter blur-3xl"></div>
          <div className="hero-blur absolute bottom-20 left-20 w-72 h-72 bg-orange-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="hero-badge opacity-0">
              <span className="inline-block bg-orange-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-orange-400 text-sm font-semibold mb-6">
                Get in Touch
              </span>
            </div>
            
            <h1 className="hero-title opacity-0 text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Let's Talk
              <span className="text-orange-500 block mt-2">We're Here to Help</span>
            </h1>
            
            <p className="hero-subtitle opacity-0 text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Have questions about your order, products, or anything else? 
              Our team is ready to assist you.
            </p>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path fill="#f9fafb" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* Contact Info & Form Section */}
      <div className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Information */}
            <div ref={contactInfoRef}>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Contact <span className="text-orange-500">Information</span>
              </h2>
              <div className="w-20 h-1 bg-orange-500 mb-6 rounded-full"></div>
              <p className="text-gray-600 mb-8">
                Reach out to us through any of these channels. We typically respond within 24 hours.
              </p>
              
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div
                    key={index}
                    ref={el => { infoItemsRef.current[index] = el; }}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 opacity-0"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl float-animation">{info.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{info.title}</h3>
                        {info.details.map((detail, i) => (
                          <p key={i} className="text-gray-600">{detail}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Social Links */}
              <div className="mt-8 p-6 bg-orange-50 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  {["Facebook", "Twitter", "Instagram", "LinkedIn"].map((social, index) => (
                    <a
                      key={index}
                      href="#"
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-md hover:scale-110"
                    >
                      {social[0]}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div ref={contactFormRef}>
              <div className="form-container bg-white rounded-2xl shadow-xl p-8 opacity-0">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Send Us a <span className="text-orange-500">Message</span>
                </h2>
                <div className="w-20 h-1 bg-orange-500 mb-6 rounded-full"></div>
                
                {isSubmitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 animate-pulse">
                    ✓ Thank you for your message! We'll get back to you soon.
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Subject *</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="order">Order Status</option>
                      <option value="return">Returns & Refunds</option>
                      <option value="product">Product Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div ref={mapRef} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="map-container opacity-0">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
              Find <span className="text-orange-500">Us</span>
            </h2>
            <div className="w-20 h-1 bg-orange-500 mx-auto mb-8 rounded-full"></div>
            <p className="text-center text-gray-600 mb-8">
              Visit our main office at SM Fairview, Quezon City
            </p>
            
            <div className="rounded-2xl overflow-hidden shadow-xl h-96">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.512906735287!2d121.058263314842!3d14.704918089733897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b12003b2e0b9%3A0x2b8e8b8e8b8e8b8e!2sSM%20City%20Fairview!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="SM Fairview Location"
              ></iframe>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                <span className="font-semibold">Address:</span> SM Fairview, Quirino Highway corner Regalado Avenue, Quezon City, Metro Manila, Philippines
              </p>
              <p className="text-gray-500 text-sm mt-2">
                <span className="font-semibold">Store Hours:</span> Monday to Saturday, 10:00 AM - 8:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div ref={faqRef} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
            Frequently Asked <span className="text-orange-500">Questions</span>
          </h2>
          <div className="w-20 h-1 bg-orange-500 mx-auto mb-12 rounded-full"></div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                ref={el => { faqItemsRef.current[index] = el; }}
                className="bg-white rounded-xl shadow-md overflow-hidden opacity-0"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-orange-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800">{faq.question}</span>
                  <span className="text-orange-500 text-2xl transform transition-transform duration-300">
                    {openFaq === index ? "−" : "+"}
                  </span>
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-300 ${
                  openFaq === index ? "max-h-40 pb-4" : "max-h-0"
                }`}>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 md:py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 pulse-animation">
            Need Immediate Help?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Our customer support team is available 24/7 to assist you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+639123456789"
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:scale-105 transform duration-300"
            >
              Call Now
            </a>
            <a 
              href="#"
              className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 rounded-full font-semibold transition-all hover:scale-105 transform duration-300"
            >
              Start Live Chat
            </a>
          </div>
        </div>
      </div>
    </>
  );
}