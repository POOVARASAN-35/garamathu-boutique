import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Award, 
  Truck, 
  HelpCircle, 
  Instagram, 
  Facebook, 
  Youtube, 
  MessageSquare,
  Info
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import contactBanner from '../../assets/image/contact-banner.png';

export default function Contact() {
  const { addToast } = useToast();

  // Contact Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Touched states for validation visibility
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    message: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // FAQ Accordion Active Index
  const [activeFaq, setActiveFaq] = useState(null);

  // Validation Check Functions
  const isNameValid = name.trim().length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = /^[0-9]{10}$/.test(phone.replace(/\D/g, ''));
  const isMessageValid = message.trim().length >= 10;

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      phone: true,
      message: true
    });

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isMessageValid) {
      addToast('Please correct the validation errors before sending.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate sending message to backend
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
      setTouched({
        name: false,
        email: false,
        phone: false,
        message: false
      });
    }, 1800);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      addToast('Please enter a valid email address.', 'warning');
      return;
    }
    addToast('Thank you for subscribing to our newsletter!', 'success');
    setNewsletterEmail('');
  };

  // FAQs data list
  const faqs = [
    {
      q: "How long does delivery take?",
      a: "For Erode district, we offer free express shipping within 24-48 hours. For other districts across Tamil Nadu and India, standard delivery takes 3 to 5 business days."
    },
    {
      q: "Do you offer Cash on Delivery?",
      a: "Yes, we support Cash on Delivery (COD) for eligible pincodes across India, alongside secure online payments like UPI, Debit/Credit cards, and Netbanking."
    },
    {
      q: "Can I exchange my saree?",
      a: "We accept exchanges within 7 days of delivery, provided the saree remains unused, unwashed, with all original tags attached and product fold intact."
    },
    {
      q: "How can I track my order?",
      a: "Once your saree package is shipped, you will receive a tracking link via SMS and Email to monitor your parcel in real-time."
    },
    {
      q: "Is shipping free?",
      a: "Yes! Shipping is completely free for all orders delivered to Erode District. For all other districts, a nominal custom shipping fee will apply at checkout."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept UPI (Google Pay, PhonePe, Paytm), Net Banking, Visa, Mastercard, RuPay cards, and Razorpay secure gateways."
    }
  ];

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="w-full overflow-hidden">
        <img 
          src={contactBanner} 
          alt="Contact Us Banner" 
          className="w-full h-auto block"
        />
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-20">

        {/* 2. Contact Information Cards */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Store Address */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white p-6 rounded-[20px] shadow-luxury border border-gray-100 flex flex-col justify-between items-start text-left group transition-all duration-300 hover:border-sienna-200"
            >
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-sienna-50 flex items-center justify-center text-sienna-600 transition-colors duration-300 group-hover:bg-sienna-600 group-hover:text-white">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-playfair text-lg font-bold text-gray-900">Store Address</h3>
                  <p className="text-xs text-gray-500 font-poppins mt-2 leading-relaxed">
                    📍 Gramathu Boutique<br />
                    Erode, Tamil Nadu, India
                  </p>
                </div>
              </div>
              <div className="pt-4 w-full">
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs font-bold text-sienna-600 hover:text-sienna-700 uppercase tracking-wider font-poppins flex items-center gap-1"
                >
                  Get Directions <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

            {/* Card 2: Phone Support */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white p-6 rounded-[20px] shadow-luxury border border-gray-100 flex flex-col justify-between items-start text-left group transition-all duration-300 hover:border-sienna-200"
            >
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-sienna-50 flex items-center justify-center text-sienna-600 transition-colors duration-300 group-hover:bg-sienna-600 group-hover:text-white">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-playfair text-lg font-bold text-gray-900">Phone</h3>
                  <p className="text-xs text-gray-500 font-poppins mt-2 leading-relaxed">
                    📞 +91 63694 68700<br />
                    Available for Call & WhatsApp
                  </p>
                </div>
              </div>
              <div className="pt-4 w-full">
                <a 
                  href="tel:+916369468700" 
                  className="text-xs font-bold text-sienna-600 hover:text-sienna-700 uppercase tracking-wider font-poppins flex items-center gap-1"
                >
                  Click to Call <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

            {/* Card 3: Email Inquiries */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white p-6 rounded-[20px] shadow-luxury border border-gray-100 flex flex-col justify-between items-start text-left group transition-all duration-300 hover:border-sienna-200"
            >
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-sienna-50 flex items-center justify-center text-sienna-600 transition-colors duration-300 group-hover:bg-sienna-600 group-hover:text-white">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-playfair text-lg font-bold text-gray-900">Email</h3>
                  <p className="text-xs text-gray-500 font-poppins mt-2 leading-relaxed">
                    📧 ksragavarthini@gmail.com<br />
                    We reply within 24 business hours
                  </p>
                </div>
              </div>
              <div className="pt-4 w-full">
                <a 
                  href="mailto:ksragavarthini@gmail.com" 
                  className="text-xs font-bold text-sienna-600 hover:text-sienna-700 uppercase tracking-wider font-poppins flex items-center gap-1"
                >
                  Click to Email <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

            {/* Card 4: Business Hours */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white p-6 rounded-[20px] shadow-luxury border border-gray-100 flex flex-col justify-between items-start text-left group transition-all duration-300 hover:border-sienna-200"
            >
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-sienna-50 flex items-center justify-center text-sienna-600 transition-colors duration-300 group-hover:bg-sienna-600 group-hover:text-white">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-playfair text-lg font-bold text-gray-900">Business Hours</h3>
                  <div className="text-xs text-gray-555 font-poppins mt-2.5 space-y-1">
                    <p className="flex justify-between"><span>Mon – Sat:</span> <span className="font-semibold text-gray-800">9:30 AM – 8:30 PM</span></p>
                    <p className="flex justify-between"><span>Sunday:</span> <span className="font-semibold text-gray-800">10:00 AM – 6:00 PM</span></p>
                  </div>
                </div>
              </div>
              <div className="pt-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-poppins">
                Open Festive Days
              </div>
            </motion.div>

          </div>
        </section>

        {/* 3. Contact Form & Google Map */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Contact Form Left Side (Glassmorphism card) */}
          <div className="lg:col-span-7 bg-white/70 backdrop-blur-md border border-gray-200/50 rounded-3xl p-6 sm:p-8 shadow-luxury text-left flex flex-col justify-between">
            <div>
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
              <p className="text-xs text-gray-500 mb-8 font-poppins leading-relaxed">
                If you have custom color inquiries, special bridal requests, or shipping questions, feel free to fill out the form below.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-5 font-poppins text-xs">
                
                {/* Full Name */}
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="Enter your name"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:border-sienna-500 focus:outline-none font-semibold transition-all shadow-sm"
                    required
                  />
                  {/* Validation text */}
                  {touched.name && (
                    <div className="text-[10.5px] font-semibold mt-1">
                      {isNameValid ? (
                        <span className="text-green-600 flex items-center gap-1">✅ Name looks good</span>
                      ) : (
                        <span className="text-red-500 flex items-center gap-1">❌ Please enter your name (min 3 chars)</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Email and Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="you@example.com"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:border-sienna-500 focus:outline-none font-semibold transition-all shadow-sm"
                      required
                    />
                    {touched.email && (
                      <div className="text-[10.5px] font-semibold mt-1">
                        {isEmailValid ? (
                          <span className="text-green-600 flex items-center gap-1">✅ Email looks good</span>
                        ) : (
                          <span className="text-red-500 flex items-center gap-1">❌ Please enter a valid email</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Phone Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      placeholder="10-digit number"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:border-sienna-500 focus:outline-none font-semibold transition-all shadow-sm"
                      required
                    />
                    {touched.phone && (
                      <div className="text-[10.5px] font-semibold mt-1">
                        {isPhoneValid ? (
                          <span className="text-green-600 flex items-center gap-1">✅ Phone looks good</span>
                        ) : (
                          <span className="text-red-500 flex items-center gap-1">❌ Phone number must contain 10 digits</span>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Custom Order / Shipping / General Inquiry"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:border-sienna-500 focus:outline-none font-semibold transition-all shadow-sm"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Message *</label>
                  <textarea
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onBlur={() => handleBlur('message')}
                    placeholder="Type your message description here..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:border-sienna-500 focus:outline-none font-semibold transition-all shadow-sm leading-relaxed"
                    required
                  />
                  {touched.message && (
                    <div className="text-[10.5px] font-semibold mt-1">
                      {isMessageValid ? (
                        <span className="text-green-600 flex items-center gap-1">✅ Message looks good</span>
                      ) : (
                        <span className="text-red-500 flex items-center gap-1">❌ Message cannot be empty (min 10 chars)</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-sienna-600 hover:bg-sienna-750 text-white font-poppins font-semibold py-4 rounded-xl uppercase tracking-widest transition-all shadow-accent-glow flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 duration-350"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4.5 h-4.5" />
                      Send Message
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>

          {/* Embedded Google Map Right Side */}
          <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-luxury flex flex-col justify-between hover:shadow-luxury-hover transition-all duration-500">
            <div className="space-y-4 w-full">
              <h3 className="font-playfair text-xl font-bold text-gray-900 text-left">Visit Our Store</h3>
              <p className="text-xs text-gray-500 font-poppins text-left leading-relaxed">
                Experience our premium saree collection in person and enjoy personalized assistance from our team.
              </p>
              
              {/* Map container with hover scale effect */}
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group cursor-pointer mt-4">
                <iframe 
                  title="Gramathu Boutique Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125218.42398418042!2d77.63227443831885!3d11.344444444444445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba96f4c391d1e4c%3A0x3ba96f4c391d1e4c!2sErode%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1720888888888!5m2!1sen!2sin" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ border: 0 }}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-left">
              <div className="w-8 h-8 rounded-full bg-sienna-50 flex items-center justify-center text-sienna-600 flex-shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-semibold text-gray-400 tracking-wide uppercase font-poppins">
                Valet parking available for all clients.
              </p>
            </div>
          </div>

        </section>

        {/* 4. Why Choose Gramathu Boutique Feature Cards */}
        <section className="text-center space-y-12">
          <div className="space-y-2">
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 tracking-wide">
              Why Choose Gramathu Boutique
            </h2>
            <p className="text-xs text-sienna-600 font-poppins font-semibold uppercase tracking-widest">
              Signature boutique values
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1: Premium Quality */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sienna-700 to-sienna-500 flex items-center justify-center text-white shadow-md mb-6 transition-transform duration-500 group-hover:rotate-12">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-playfair text-lg font-bold text-gray-900">Premium Quality</h3>
              <p className="text-xs text-gray-500 font-poppins mt-2 leading-relaxed">
                Carefully selected sarees crafted with elegance and the finest silk threads.
              </p>
            </motion.div>

            {/* Feature 2: Secure Shopping */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sienna-700 to-sienna-500 flex items-center justify-center text-white shadow-md mb-6 transition-transform duration-500 group-hover:rotate-12">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-playfair text-lg font-bold text-gray-900">Secure Shopping</h3>
              <p className="text-xs text-gray-500 font-poppins mt-2 leading-relaxed">
                100% secure checkout powered by India's most trusted payment methods.
              </p>
            </motion.div>

            {/* Feature 3: Free District Shipping */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sienna-700 to-sienna-500 flex items-center justify-center text-white shadow-md mb-6 transition-transform duration-500 group-hover:rotate-12">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-playfair text-lg font-bold text-gray-900">Fast Delivery</h3>
              <p className="text-xs text-gray-500 font-poppins mt-2 leading-relaxed">
                Quick and reliable delivery across India. Free shipping applies to Erode District.
              </p>
            </motion.div>

            {/* Feature 4: Customer Support */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sienna-700 to-sienna-500 flex items-center justify-center text-white shadow-md mb-6 transition-transform duration-500 group-hover:rotate-12">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-playfair text-lg font-bold text-gray-900">Customer Support</h3>
              <p className="text-xs text-gray-500 font-poppins mt-2 leading-relaxed">
                Friendly support coordinates before and after your purchase.
              </p>
            </motion.div>

          </div>
        </section>

        {/* 5. Frequently Asked Questions Accordions */}
        <section className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="font-playfair text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-xs text-sienna-600 font-poppins font-semibold uppercase tracking-widest">
              Quick answers about orders
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;

              return (
                <div 
                  key={idx}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-gray-200"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4.5 flex justify-between items-center text-left focus:outline-none transition-colors"
                  >
                    <span className="text-sm font-bold text-gray-800 font-poppins flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-sienna-600 flex-shrink-0" />
                      {faq.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-gray-400 font-bold"
                    >
                      ▼
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-5 pt-1 text-xs text-gray-500 leading-relaxed font-poppins border-t border-gray-50/50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. Connect With Us Social Cards */}
        <section className="text-center space-y-10">
          <div className="space-y-2">
            <h2 className="font-playfair text-3xl font-bold text-gray-900">Connect With Us</h2>
            <p className="text-xs text-sienna-600 font-poppins font-semibold uppercase tracking-widest">Follow our latest catalog launches</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* Instagram */}
            <a
              href="https://www.instagram.com/gramathu_design?igsh=eWRmbWp3MXdpbjl6"
              target="_blank"
              rel="noreferrer"
              className="group relative bg-gradient-to-br from-purple-600 to-pink-500 p-6 rounded-3xl text-white flex flex-col items-center justify-center gap-3 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Instagram className="w-8 h-8 transition-transform duration-500 group-hover:scale-110" />
              <span className="font-semibold text-xs tracking-wider uppercase font-poppins">Instagram</span>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="group relative bg-gradient-to-br from-blue-700 to-blue-500 p-6 rounded-3xl text-white flex flex-col items-center justify-center gap-3 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Facebook className="w-8 h-8 transition-transform duration-500 group-hover:scale-110" />
              <span className="font-semibold text-xs tracking-wider uppercase font-poppins">Facebook</span>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="group relative bg-gradient-to-br from-red-700 to-red-500 p-6 rounded-3xl text-white flex flex-col items-center justify-center gap-3 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Youtube className="w-8 h-8 transition-transform duration-500 group-hover:scale-110" />
              <span className="font-semibold text-xs tracking-wider uppercase font-poppins">YouTube</span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://whatsapp.com/channel/0029VbDFeYJ30LKIkbZJhx0k"
              target="_blank"
              rel="noreferrer"
              className="group relative bg-gradient-to-br from-emerald-600 to-green-500 p-6 rounded-3xl text-white flex flex-col items-center justify-center gap-3 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <MessageSquare className="w-8 h-8 transition-transform duration-500 group-hover:scale-110" />
              <span className="font-semibold text-xs tracking-wider uppercase font-poppins">WhatsApp Channel</span>
            </a>

          </div>
        </section>

        {/* 7. Newsletter Section */}
        <section className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 shadow-luxury max-w-5xl mx-auto overflow-hidden relative text-center">
          {/* Subtle background glow */}
          <div className="absolute -left-20 -bottom-20 w-48 h-48 rounded-full bg-sienna-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-sienna-500/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="font-playfair text-3xl font-bold text-gray-900">Stay Updated</h2>
            <p className="text-xs sm:text-sm text-gray-400 font-poppins font-light leading-relaxed">
              Subscribe to receive updates on our latest collections, exclusive offers, and festive arrivals.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="flex-1 bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:border-sienna-500 focus:outline-none font-semibold transition-all shadow-sm"
                required
              />
              <button
                type="submit"
                className="bg-sienna-600 hover:bg-sienna-750 text-white font-poppins font-semibold text-xs tracking-wider uppercase py-3 px-6 rounded-xl transition-all shadow-accent-glow flex items-center justify-center gap-1.5 duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>

      </div>

      {/* Form Submission Success Modal overlay */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 text-center space-y-5 shadow-luxury border border-gray-100 z-10"
            >
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-playfair text-xl font-bold text-gray-900">Thank you!</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-poppins">
                  Your message has been sent successfully. Our team will contact you soon.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-sienna-700 hover:bg-sienna-750 text-white font-poppins font-semibold py-3 text-xs tracking-widest uppercase rounded-xl transition-colors shadow-accent-glow"
              >
                Close Window
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
