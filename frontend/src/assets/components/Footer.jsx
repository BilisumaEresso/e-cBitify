// src/components/Footer.jsx
// TODO:added good footer
import logo from "../images/logo.png";
import { Twitter, Facebook, Instagram, Mail } from "lucide-react";
import { FiGithub } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-gray-50 mt-32 relative">
      {/* Newsletter Card */}
      <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-full max-w-6xl px-6">
        <div className="bg-black grid gap-8 py-10 px-6 md:grid-cols-[2fr_1fr] rounded-xl shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug">
            THE BEST SHOPPING PLATFORM FOR CUSTOMERS & SELLERS
          </h1>

          <form className="flex flex-col gap-3 md:justify-end">
            <div className="bg-white flex items-center px-4 py-2 rounded-full">
              <Mail className="text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Enter your email..."
                className="ml-2 w-full focus:outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              className="bg-white rounded-full py-2 font-medium hover:bg-gray-200 transition mt-1"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Footer Content */}
      <div className="max-w-7xl  mx-auto pt-48 pb-12 px-6 md:px-4">
        <div className="grid gap-10  md:grid-cols-1 lg:grid-cols-5">
          {/* Brand */}
          <div className="flex justify-center flex-col md:justify-end">
            <img src={logo} alt="footer logo" className="w-50 mb-4 self-center md:self-start " />
            <p className="text-gray-500 text-sm text-center md:text-left leading-relaxed">
              Our company aims building seamless website for buyers and sellers powered with AI and provide trending products with fast delivery 
            </p>

            <div className="flex self-center gap-3 mt-6">
              <Twitter
                className="bg-white p-2 rounded-full cursor-pointer hover:bg-gray-100 transition"
                size={35}
              />
              <Facebook
                className="bg-black p-2 rounded-full cursor-pointer text-white hover:bg-gray-800 transition"
                size={35}
              />
              <Instagram
                className="bg-white p-2 rounded-full cursor-pointer hover:bg-gray-100 transition"
                size={35}
              />
              <FiGithub
                className="bg-black p-2 rounded-full cursor-pointer text-white hover:bg-gray-800 transition"
                size={35}
              />
            </div>
          </div>

          {/* Company */}
          <div className="">
            <h2 className="font-semibold mb-4">COMPANY</h2>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li>
                <a href="/" className="hover:text-black transition">
                  About
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-black transition">
                  Features
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-black transition">
                  Trends
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-black transition">
                  Recommendations
                </a>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h2 className="font-semibold mb-4">HELP</h2>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li>
                <a href="/" className="hover:text-black transition">
                  Support
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-black transition">
                  Contact
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-black transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-black transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-semibold mb-4">FAQ</h2>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li>
                <a href="/" className="hover:text-black transition">
                  Ordering
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-black transition">
                  Shipping
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-black transition">
                  Returns
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-black transition">
                  Payments
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h2 className="font-semibold mb-4">RESOURCES</h2>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li>
                <a href="/" className="hover:text-black transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-black transition">
                  Docs
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-black transition">
                  API
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-black transition">
                  Community
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
