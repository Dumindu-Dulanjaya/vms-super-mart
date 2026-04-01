import React from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

const Contact = () => {
    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#00FF33] opacity-10 transform skew-x-12 translate-x-20"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                        Contact <span className="text-[#00FF33]">Us</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl text-lg font-medium border-l-4 border-[#00FF33] pl-6">
                        Have questions about our security systems or inventory? Our team at VMS Super Mart
                        is here to provide expert assistance and 24/7 technical support.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-12 mb-20 relative z-20">
                {/* Contact Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { icon: <MapPin className="text-[#00FF33]" />, title: "Location", detail: "Wariyapola, Sri Lanka", subDetail: "Main Supermarket" },
                        { icon: <Phone className="text-[#00FF33]" />, title: "Phone", detail: "0766540131", subDetail: "Available 24/7" },
                        { icon: <Mail className="text-[#00FF33]" />, title: "Email", detail: "info@vms-supermart.com", subDetail: "Fast Response" },
                        { icon: <Clock className="text-[#00FF33]" />, title: "Working Hours", detail: "Mon - Sat: 8AM - 8PM", subDetail: "Sun: 9AM - 1PM" },
                    ].map((item, index) => (
                        <div key={index} className="bg-white p-8 border-b-4 border-slate-900 shadow-xl hover:translate-y-[-5px] transition-all duration-300">
                            <div className="bg-slate-50 w-14 h-14 flex items-center justify-center mb-6">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">{item.title}</h3>
                            <p className="text-slate-800 font-bold">{item.detail}</p>
                            <p className="text-slate-400 text-sm">{item.subDetail}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Contact Form */}
                    <div className="bg-white p-10 shadow-2xl border border-slate-100">
                        <h2 className="text-3xl font-black uppercase mb-8 border-b-2 border-[#00FF33] pb-4 inline-block">
                            Send a Message
                        </h2>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Wick"
                                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:border-[#00FF33] transition-colors font-medium rounded-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="john@vms.com"
                                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:border-[#00FF33] transition-colors font-medium rounded-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Subject</label>
                                <input
                                    type="text"
                                    placeholder="Technical Query"
                                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:border-[#00FF33] transition-colors font-medium rounded-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Message</label>
                                <textarea
                                    rows="5"
                                    placeholder="How can we help you?"
                                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:border-[#00FF33] transition-colors font-medium rounded-none resize-none"
                                ></textarea>
                            </div>
                            <button className="bg-slate-900 text-white px-10 py-4 flex items-center gap-3 font-black uppercase tracking-widest hover:bg-[#00FF33] hover:text-slate-900 transition-all group rounded-none">
                                <span>Send Report</span>
                                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </form>
                    </div>

                    {/* Google Map */}
                    <div className="h-full min-h-[500px] shadow-2xl relative border-8 border-white">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.1868310052!2d80.20790887588383!3d7.604642292410313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae28f73117565d7%3A0xe213b2ce21731671!2sVMS%20SuperMart%20-Wariyapola!5e0!3m2!1sen!2slk!4v1711964500000!5m2!1sen!2slk"
                            className="w-full h-full border-none grayscale hover:grayscale-0 transition-all duration-700"
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="VMS Super Mart Location"
                        ></iframe>
                        <div className="absolute top-4 left-4 bg-slate-900 text-white p-4 font-black uppercase text-xs tracking-tighter">
                            Tactical HQ - Kurunegala Rd
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
