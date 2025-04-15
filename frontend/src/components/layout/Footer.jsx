import { Link } from "react-router-dom"
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiMail, FiMapPin, FiPhone } from "react-icons/fi"

const Footer = () => {
  const companyLinks = [
    { name: "Our Story", path: "/about" },
    { name: "Sustainability", path: "/sustainability" },
    { name: "Careers", path: "/careers" },
    { name: "Press", path: "/press" },
  ]

  const customerLinks = [
    { name: "Contact Us", path: "/contact" },
    { name: "FAQs", path: "/faq" },
    { name: "Shipping", path: "/shipping" },
    { name: "Returns", path: "/returns" },
  ]

  const legalLinks = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Accessibility", path: "/accessibility" },
  ]

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-950 text-neutral-400 pt-20 pb-12">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Section */}
          <div>
            <Link to="/" className="text-2xl font-extralight text-white tracking-widest mb-6 inline-block">
              suriAddis
            </Link>
            <p className="text-sm text-neutral-500 mb-8 max-w-xs">
              Curated essentials that transcend seasons and elevate your everyday style with timeless elegance.
            </p>
            <address className="not-italic space-y-4 text-sm">
              <div className="flex items-start">
                <FiMapPin className="mt-1 mr-3 flex-shrink-0" />
                <span>
                  123 Fashion Avenue
                  <br />
                  Addis Ababa, Ethiopia
                </span>
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
          <div className="lg:ml-auto">
            <h3 className="text-xs font-medium text-white uppercase tracking-widest mb-8">Company</h3>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm hover:text-white transition-colors duration-300 inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-xs font-medium text-white uppercase tracking-widest mb-8">Customer Care</h3>
            <ul className="space-y-4">
              {customerLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm hover:text-white transition-colors duration-300 inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Legal */}
          <div>
            <h3 className="text-xs font-medium text-white uppercase tracking-widest mb-8">Connect With Us</h3>
            <div className="flex space-x-5 mb-10">
              <a
                href="#"
                className="h-10 w-10 rounded-full border border-neutral-800 flex items-center justify-center hover:border-white hover:text-white transition-colors duration-300"
                aria-label="Facebook"
              >
                <FiFacebook size={18} />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full border border-neutral-800 flex items-center justify-center hover:border-white hover:text-white transition-colors duration-300"
                aria-label="Instagram"
              >
                <FiInstagram size={18} />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full border border-neutral-800 flex items-center justify-center hover:border-white hover:text-white transition-colors duration-300"
                aria-label="Twitter"
              >
                <FiTwitter size={18} />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full border border-neutral-800 flex items-center justify-center hover:border-white hover:text-white transition-colors duration-300"
                aria-label="YouTube"
              >
                <FiYoutube size={18} />
              </a>
            </div>

            <h3 className="text-xs font-medium text-white uppercase tracking-widest mb-8">Legal</h3>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm hover:text-white transition-colors duration-300 inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright & Payment Methods */}
        <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-neutral-600 mb-4 md:mb-0">© {currentYear} suriAddis. All rights reserved.</p>
          <div className="flex space-x-6">
            <div className="flex items-center">
              <span className="text-xs text-neutral-600 mr-2">Payment Methods:</span>
              <div className="flex space-x-3">
                <div className="h-6 w-10 bg-neutral-900 rounded flex items-center justify-center text-xs text-neutral-500">
                  Visa
                </div>
                <div className="h-6 w-10 bg-neutral-900 rounded flex items-center justify-center text-xs text-neutral-500">
                  MC
                </div>
                <div className="h-6 w-10 bg-neutral-900 rounded flex items-center justify-center text-xs text-neutral-500">
                  PayPal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
