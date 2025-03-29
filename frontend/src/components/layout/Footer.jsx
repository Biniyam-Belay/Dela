import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiFacebook, 
  FiInstagram, 
  FiTwitter, 
  FiYoutube,
  FiMail,
  FiMapPin,
  FiPhone
} from 'react-icons/fi';

const Footer = () => {
  const companyLinks = [
    { name: 'Our Story', path: '/about' },
    { name: 'Sustainability', path: '/sustainability' },
    { name: 'Careers', path: '/careers' },
    { name: 'Press', path: '/press' },
  ];

  const customerLinks = [
    { name: 'Contact Us', path: '/contact' },
    { name: 'FAQs', path: '/faq' },
    { name: 'Shipping', path: '/shipping' },
    { name: 'Returns', path: '/returns' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Accessibility', path: '/accessibility' },
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-16 pb-8">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">
              Contact
            </h3>
            <address className="not-italic space-y-4">
              <div className="flex items-start">
                <FiMapPin className="mt-1 mr-3 flex-shrink-0" />
                <span>123 Fashion Avenue<br />Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center">
                <FiPhone className="mr-3" />
                <a href="tel:+251123456789" className="hover:text-white transition-colors">
                  +251 123 456 789
                </a>
              </div>
              <div className="flex items-center">
                <FiMail className="mr-3" />
                <a href="mailto:info@suriaddis.com" className="hover:text-white transition-colors">
                  info@suriaddis.com
                </a>
              </div>
            </address>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">
              Customer Care
            </h3>
            <ul className="space-y-3">
              {customerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Legal */}
          <div>
            <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">
              Follow Us
            </h3>
            <div className="flex space-x-4 mb-8">
              <a href="#" className="hover:text-white transition-colors duration-300" aria-label="Facebook">
                <FiFacebook size={18} />
              </a>
              <a href="#" className="hover:text-white transition-colors duration-300" aria-label="Instagram">
                <FiInstagram size={18} />
              </a>
              <a href="#" className="hover:text-white transition-colors duration-300" aria-label="Twitter">
                <FiTwitter size={18} />
              </a>
              <a href="#" className="hover:text-white transition-colors duration-300" aria-label="YouTube">
                <FiYoutube size={18} />
              </a>
            </div>

            <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright & Payment Methods */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-neutral-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} suriAddis. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {/* Payment method icons would go here */}
            <span className="text-xs text-neutral-500">Visa</span>
            <span className="text-xs text-neutral-500">Mastercard</span>
            <span className="text-xs text-neutral-500">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;