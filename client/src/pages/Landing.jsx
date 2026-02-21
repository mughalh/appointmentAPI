import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  FiCalendar, FiClock, FiUsers, FiShield, FiMail, FiSmartphone,
  FiChevronRight, FiStar, FiAward, FiTrendingUp, FiCheckCircle,
  FiPlay, FiPause, FiArrowRight, FiMapPin, FiBriefcase
} from 'react-icons/fi';

const Landing = () => {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [counter, setCounter] = useState({
    users: 0,
    appointments: 0,
    providers: 0,
    satisfaction: 0
  });

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    // Animated counters
    const interval = setInterval(() => {
      setCounter(prev => {
        if (prev.users < 10000) return { ...prev, users: prev.users + 100 };
        if (prev.appointments < 50000) return { ...prev, appointments: prev.appointments + 500 };
        if (prev.providers < 500) return { ...prev, providers: prev.providers + 5 };
        if (prev.satisfaction < 98) return { ...prev, satisfaction: prev.satisfaction + 1 };
        return prev;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <FiCalendar size={32} />,
      title: 'Smart Scheduling',
      description: 'Intelligent appointment booking with conflict detection using interval trees',
      color: 'blue',
      gradient: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
      stats: '99.9% accuracy'
    },
    {
      icon: <FiClock size={32} />,
      title: 'Real-time Availability',
      description: 'See live availability of your favorite service providers with instant updates',
      color: 'green',
      gradient: 'linear-gradient(135deg, #00b294 0%, #008272 100%)',
      stats: '< 1s response'
    },
    {
      icon: <FiUsers size={32} />,
      title: 'Multi-provider Support',
      description: 'Manage multiple employees and services with intelligent scheduling',
      color: 'purple',
      gradient: 'linear-gradient(135deg, #881798 0%, #5f0f6b 100%)',
      stats: 'Unlimited providers'
    },
    {
      icon: <FiShield size={32} />,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security and encryption',
      color: 'orange',
      gradient: 'linear-gradient(135deg, #ff8c00 0%, #d67600 100%)',
      stats: '256-bit encryption'
    },
    {
      icon: <FiMail size={32} />,
      title: 'Email Notifications',
      description: 'Get instant updates about your appointments with smart reminders',
      color: 'red',
      gradient: 'linear-gradient(135deg, #e81123 0%, #b10e1c 100%)',
      stats: '99% delivery rate'
    },
    {
      icon: <FiSmartphone size={32} />,
      title: 'Mobile Friendly',
      description: 'Beautiful Metro design that works seamlessly on all devices',
      color: 'teal',
      gradient: 'linear-gradient(135deg, #00b7c3 0%, #008b94 100%)',
      stats: '100% responsive'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Salon Owner',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      content: 'AppointMaster has transformed how we manage appointments. Our booking efficiency increased by 200%!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Massage Therapist',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      content: 'The real-time availability feature is a game-changer. My clients love how easy it is to book.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Spa Manager',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      content: 'Finally a system that understands the needs of multi-provider businesses. Highly recommended!',
      rating: 5
    }
  ];

  const stats = [
    { icon: <FiUsers />, value: counter.users.toLocaleString(), label: 'Happy Users', suffix: '+' },
    { icon: <FiCalendar />, value: counter.appointments.toLocaleString(), label: 'Appointments', suffix: '+' },
    { icon: <FiBriefcase />, value: counter.providers.toLocaleString(), label: 'Service Providers', suffix: '+' },
    { icon: <FiStar />, value: counter.satisfaction, label: 'Satisfaction Rate', suffix: '%' }
  ];

  return (
    <div className="landing-page" style={{ overflowX: 'hidden' }}>
      {/* Hero Section with Parallax */}
      <motion.section 
        className="hero-section"
        style={{
          opacity: heroOpacity,
          scale: heroScale,
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          color: 'white',
          padding: '100px 20px',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 50%, rgba(0,120,212,0.2) 0%, transparent 50%)',
          animation: 'pulse 4s ease-in-out infinite'
        }} />

        {/* Floating Elements */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: i % 2 === 0 ? '6px' : '10px',
              height: i % 2 === 0 ? '6px' : '10px',
              background: `rgba(0,120,212,${0.1 + i * 0.02})`,
              borderRadius: '50%',
              left: `${(i * 7) % 100}%`,
              top: `${(i * 13) % 100}%`,
              filter: 'blur(1px)'
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}

        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{
                display: 'inline-block',
                padding: '8px 20px',
                background: 'rgba(0,120,212,0.2)',
                borderRadius: '40px',
                marginBottom: '30px',
                border: '1px solid rgba(0,120,212,0.3)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✨ Introducing AppointMaster 2.0</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: 'clamp(40px, 8vw, 72px)',
                fontWeight: '800',
                marginBottom: '20px',
                lineHeight: 1.1
              }}
            >
              <span style={{ color: 'var(--primary)' }}>Smart</span> Appointment
              <br />
              Booking for Modern Business
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                fontSize: 'clamp(16px, 3vw, 20px)',
                opacity: 0.9,
                marginBottom: '40px',
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              The intelligent appointment system that uses advanced algorithms to optimize your scheduling,
              reduce conflicts, and maximize efficiency.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link
                to="/signup"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  color: 'white',
                  padding: '16px 40px',
                  borderRadius: '50px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 10px 30px rgba(0,120,212,0.3)',
                  transition: 'transform 0.3s, box-shadow 0.3s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,120,212,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,120,212,0.3)';
                }}
              >
                Start Free Trial <FiArrowRight />
              </Link>

              <Link
                to="/login"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  padding: '16px 40px',
                  borderRadius: '50px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                Watch Demo <FiPlay />
              </Link>
            </motion.div>

            {/* Stats Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '40px',
                marginTop: '60px',
                flexWrap: 'wrap'
              }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '5px' }}>
                    {stat.icon}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                    {stat.value}{stat.suffix}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.7 }}>{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section with Cards */}
      <section style={{ padding: '100px 20px', background: 'var(--background)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: '800',
              marginBottom: '20px'
            }}>
              Why Choose <span style={{ color: 'var(--primary)' }}>AppointMaster</span>
            </h2>
            <p style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              Built with cutting-edge technology and designed for the modern business
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '30px'
          }}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '40px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                {/* Background Gradient */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: feature.gradient
                }} />

                {/* Icon */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: feature.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '30px',
                  color: 'white'
                }}>
                  {feature.icon}
                </div>

                <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                  {feature.description}
                </p>

                {/* Stats Badge */}
                <div style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: 'var(--background)',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'var(--primary)'
                }}>
                  {feature.stats}
                </div>

                {/* Decorative Elements */}
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: feature.gradient,
                  opacity: 0.1,
                  borderRadius: '50%'
                }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        padding: '100px 20px',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '800', marginBottom: '20px' }}>
              How It <span style={{ color: 'var(--primary)' }}>Works</span>
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
              Get started in minutes with our simple 4-step process
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
          }}>
            {[
              {
                step: '01',
                title: 'Sign Up',
                desc: 'Create your account as a customer or service provider',
                icon: '👤'
              },
              {
                step: '02',
                title: 'Choose Service',
                desc: 'Browse available services and find the perfect provider',
                icon: '🔍'
              },
              {
                step: '03',
                title: 'Book',
                desc: 'Select your preferred time and confirm instantly',
                icon: '📅'
              },
              {
                step: '04',
                title: 'Get Notified',
                desc: 'Receive confirmations and reminders via email',
                icon: '📧'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '20px',
                  padding: '40px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  fontSize: '48px',
                  opacity: 0.2,
                  fontWeight: 'bold'
                }}>
                  {item.step}
                </div>

                <div style={{
                  fontSize: '64px',
                  marginBottom: '20px'
                }}>
                  {item.icon}
                </div>

                <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ opacity: 0.8 }}>{item.desc}</p>

                {/* Progress Line */}
                {index < 3 && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '-15px',
                    width: '30px',
                    height: '2px',
                    background: 'var(--primary)',
                    display: 'none',
                    '@media (min-width: 1024px)': {
                      display: 'block'
                    }
                  }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '100px 20px', background: 'var(--background)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '800', marginBottom: '20px' }}>
              What Our <span style={{ color: 'var(--primary)' }}>Clients Say</span>
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
              Trusted by hundreds of businesses worldwide
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '40px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}
              >
                {/* Quote Mark */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  fontSize: '60px',
                  color: 'var(--primary)',
                  opacity: 0.2,
                  fontFamily: 'serif'
                }}>
                  "
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} fill="var(--warning)" color="var(--warning)" />
                  ))}
                </div>

                <p style={{
                  fontSize: '16px',
                  color: 'var(--text-secondary)',
                  marginBottom: '20px',
                  lineHeight: 1.8,
                  fontStyle: 'italic'
                }}>
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div>
                    <p style={{ fontWeight: 'bold' }}>{testimonial.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '100px 20px',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}
        >
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: '800',
            marginBottom: '20px'
          }}>
            Ready to Transform Your Business?
          </h2>
          
          <p style={{
            fontSize: '18px',
            marginBottom: '40px',
            opacity: 0.9
          }}>
            Join thousands of businesses already using AppointMaster to streamline their appointments
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/signup"
              style={{
                background: 'white',
                color: 'var(--primary)',
                padding: '16px 48px',
                borderRadius: '50px',
                fontSize: '18px',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Start Free Trial <FiArrowRight />
            </Link>

            <Link
              to="/contact"
              style={{
                background: 'transparent',
                color: 'white',
                padding: '16px 48px',
                borderRadius: '50px',
                fontSize: '18px',
                fontWeight: 'bold',
                textDecoration: 'none',
                border: '2px solid white',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Contact Sales
            </Link>
          </div>

          {/* Trust Badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            marginTop: '50px',
            flexWrap: 'wrap',
            opacity: 0.8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCheckCircle /> No credit card required
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCheckCircle /> 14-day free trial
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCheckCircle /> Cancel anytime
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1a1a1a',
        color: 'white',
        padding: '60px 20px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '40px'
          }}>
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '20px', color: 'var(--primary)' }}>AppointMaster</h3>
              <p style={{ opacity: 0.7, lineHeight: 1.6 }}>
                The intelligent appointment booking system for modern businesses.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: '20px' }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, opacity: 0.7 }}>
                <li style={{ marginBottom: '10px' }}><Link to="/features" style={{ color: 'white', textDecoration: 'none' }}>Features</Link></li>
                <li style={{ marginBottom: '10px' }}><Link to="/pricing" style={{ color: 'white', textDecoration: 'none' }}>Pricing</Link></li>
                <li style={{ marginBottom: '10px' }}><Link to="/faq" style={{ color: 'white', textDecoration: 'none' }}>FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '20px' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, opacity: 0.7 }}>
                <li style={{ marginBottom: '10px' }}><Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>About</Link></li>
                <li style={{ marginBottom: '10px' }}><Link to="/blog" style={{ color: 'white', textDecoration: 'none' }}>Blog</Link></li>
                <li style={{ marginBottom: '10px' }}><Link to="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '20px' }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0, opacity: 0.7 }}>
                <li style={{ marginBottom: '10px' }}><Link to="/privacy" style={{ color: 'white', textDecoration: 'none' }}>Privacy</Link></li>
                <li style={{ marginBottom: '10px' }}><Link to="/terms" style={{ color: 'white', textDecoration: 'none' }}>Terms</Link></li>
              </ul>
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            paddingTop: '40px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            opacity: 0.5,
            fontSize: '14px'
          }}>
            © 2024 AppointMaster. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Global Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default Landing;