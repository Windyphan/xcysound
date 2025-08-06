import React from 'react';
import { Link } from 'react-router-dom';
import { FiMusic, FiMail, FiTwitter, FiFacebook, FiInstagram, FiHeart } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-sections">
            {/* Brand Section */}
            <div className="footer-section">
              <div className="footer-brand">
                <FiMusic className="brand-icon" />
                <span className="brand-name">XcySound</span>
              </div>
              <p className="footer-description">
                Your ultimate destination for discovering and purchasing amazing music.
                Stream previews, buy tracks, and build your personal music library.
              </p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Twitter">
                  <FiTwitter />
                </a>
                <a href="#" className="social-link" aria-label="Facebook">
                  <FiFacebook />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <FiInstagram />
                </a>
                <a href="#" className="social-link" aria-label="Email">
                  <FiMail />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/browse">Browse Music</Link></li>
                <li><Link to="/register">Sign Up</Link></li>
                <li><Link to="/login">Login</Link></li>
              </ul>
            </div>

            {/* Genres */}
            <div className="footer-section">
              <h3 className="footer-title">Popular Genres</h3>
              <ul className="footer-links">
                <li><Link to="/browse?genre=Electronic">Electronic</Link></li>
                <li><Link to="/browse?genre=Synthwave">Synthwave</Link></li>
                <li><Link to="/browse?genre=Vaporwave">Vaporwave</Link></li>
                <li><Link to="/browse?genre=Ambient">Ambient</Link></li>
                <li><Link to="/browse?genre=Pop">Pop</Link></li>
                <li><Link to="/browse?genre=Dream Pop">Dream Pop</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="footer-section">
              <h3 className="footer-title">Support</h3>
              <ul className="footer-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="footer-section">
              <h3 className="footer-title">Stay Updated</h3>
              <p className="newsletter-text">
                Get notified about new releases and exclusive deals
              </p>
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                />
                <button className="newsletter-btn">
                  Subscribe
                </button>
              </div>
              <div className="payment-methods">
                <span className="payment-title">We Accept:</span>
                <div className="payment-icons">
                  <span className="payment-icon">💳</span>
                  <span className="payment-icon">🏦</span>
                  <span className="payment-icon">💎</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p className="copyright">
                © 2024 XcySound. All rights reserved.
              </p>
              <p className="made-with-love">
                Made with <FiHeart className="heart-icon" /> for music lovers
              </p>
              <div className="footer-bottom-links">
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
