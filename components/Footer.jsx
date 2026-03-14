// components/Footer.jsx
import Link from 'next/link'
import React from 'react'
import { FaPhone, FaLocationDot, FaEnvelope, FaArrowRight, FaFacebookF, FaXTwitter, FaInstagram } from 'react-icons/fa6'

export default function Footer() {
    return (
        <footer>
            <div className="container-fluid">
                <div className="row row-gap-5 mb-48">
                    <div className="col-lg-4 col-md-6">
                        <img src="/assets/media/images/logo.png" className="footer-logo mb-24" alt="Bricole.ma"/>
                        <p className="mb-32">
                            At Revealé, we believe in nurturing your skin <br/>
                            with nature&apos;s best ingredients.
                        </p>
                        <form className="newslatter">
                            <input type="email" id="newemail" placeholder="Your Email Address..." required/>
                            <button type="submit" aria-label="Submit">
                                <FaArrowRight size={20} color="#FAFAFA" />
                            </button>
                        </form>
                    </div>

                    <div className="col-lg-2 col-6 d-flex justify-content-md-center justify-content-start">
                    <div className="link-block">
                            <h5 className="fw-500 light-black mb-24">Explore</h5>
                            <Link href="/">Home</Link>
                            <Link href="/about">About Us</Link>
                            <Link href="/contact">Contact Us</Link>
                            <Link href="/listing/grid">Listing Grid</Link>
                            <Link href="/blogs">Blogs</Link>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-6 order-md-0 order-4">
                        <div className="contact-info">
                            <h5 className="fw-500 mb-24">Contact Us</h5>

                            <div className="info-block mb-20">
                                <div className="info-icon">
                                    <FaPhone size={22} color="#141516" />
                                </div>
                                <div>
                                    <h6 className="mb-6">For More Information</h6>
                                    <Link href="tel:12345698" className="text-16 hover-content">(701) 235-4590</Link>
                                </div>
                            </div>

                            <div className="info-block mb-20">
                                <div className="info-icon">
                                    <FaLocationDot size={22} color="#141516" />
                                </div>
                                <div>
                                    <h6 className="mb-6">Location</h6>
                                    <p>14 Main Boulevard, Pennsylvania </p>
                                </div>
                            </div>

                            <div className="info-block">
                                <div className="info-icon">
                                    <FaEnvelope size={22} color="#141516" />
                                </div>
                                <div>
                                    <h6 className="mb-6">Email</h6>
                                    <Link href="mailto:info@beautysalon.com" className="text-16 hover-content">
                                        info@beautysalon.com
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-6">
                        <div className="social-wrap">
                            <h5 className="fw-500 light-black mb-24">Follow Us On Social:</h5>
                            <div className="social-icon">
                                <Link href="#" aria-label="Facebook">
                                    <FaFacebookF size={20} color="#0C0C0D" />
                                </Link>
                                <Link href="#" aria-label="Twitter">
                                    <FaXTwitter size={20} color="#0C0C0D" />
                                </Link>
                                <Link href="#" aria-label="Instagram">
                                    <FaInstagram size={20} color="#0C0C0D" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hr-line bg-light mb-48"></div>

                <div className="text-center">
                    <p className="light-black">© 2025. All rights reserved by UI Paradox</p>
                </div>
            </div>
        </footer>
    )
}