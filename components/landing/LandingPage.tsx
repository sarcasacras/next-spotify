"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function LandingPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Parallax transforms
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  
  // Gradient opacity that increases as user scrolls
  const gradientOpacity = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Global Gradient Background */}
      <motion.div 
        className="fixed inset-0 bg-gradient-to-b from-black to-gray-900 pointer-events-none z-0"
        style={{ opacity: gradientOpacity }}
      />
      
      {/* Floating Background Elements */}
      <motion.div 
        className="fixed inset-0 pointer-events-none z-10"
        style={{ y: backgroundY }}
      >
        {/* Gradient Orbs */}
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-pink-500/30 to-purple-500/40 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-cyan-500/35 to-blue-500/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3] 
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1 
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/25 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.5, 0.2] 
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.5 
          }}
        />
        
        {/* Floating Musical Notes */}
        <motion.div 
          className="absolute top-1/4 left-1/4 text-pink-500/30 text-2xl"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.3 
          }}
        >♪</motion.div>
        <motion.div 
          className="absolute top-3/4 right-1/4 text-cyan-500/30 text-3xl z-0"
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, -5, 0] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.7 
          }}
        >♫</motion.div>
        <motion.div 
          className="absolute top-1/2 right-1/3 text-purple-500/30 text-xl"
          animate={{ 
            y: [0, -25, 0],
            rotate: [0, 10, 0] 
          }}
          transition={{ 
            duration: 3.5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1 
          }}
        >♪</motion.div>
        <motion.div 
          className="absolute bottom-1/4 left-1/3 text-lime-500/30 text-2xl"
          animate={{ 
            y: [0, -18, 0],
            rotate: [0, -8, 0] 
          }}
          transition={{ 
            duration: 4.5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1.5 
          }}
        >♫</motion.div>
      </motion.div>

      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center px-6 z-20"
        style={{ y: heroY }}
      >
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title */}
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            Your Music Library
            <br />
            Reimagined
          </motion.h1>
          
          {/* Tagline */}
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-4 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            Your Spotify library organized in a beautiful album-cover grid
          </motion.p>
          
          {/* Sign In Call to Action */}
          <motion.div 
            className="flex flex-col gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          >
            <motion.p 
              className="text-gray-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Ready to transform your listening experience?
            </motion.p>
            
            <motion.button
              onClick={async () => {
                setIsSigningIn(true);
                try {
                  await signIn("spotify");
                } finally {
                  setIsSigningIn(false);
                }
              }}
              disabled={isSigningIn}
              className="relative inline-flex cursor-pointer items-center justify-center w-[285px] p-0.5 overflow-hidden text-lg font-medium text-gray-900 rounded-full group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 disabled:opacity-75 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105"
            >
              <span className="relative px-8 py-4 transition-all ease-in duration-75 bg-surface rounded-full group-hover:bg-transparent group-hover:dark:bg-transparent font-bold focus:outline-none flex items-center justify-center min-w-[200px] h-[56px]">
                {isSigningIn ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    Connect with Spotify
                  </div>
                )}
              </span>
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Product Showcase Section */}
      <motion.section 
        className="relative py-20 px-6 z-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Hero Product Image */}
          <div className="text-center mb-20">
            <motion.h2 
              className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent py-2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Your Library, Beautifully Organized
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Experience your Spotify library like never before. Every album cover becomes a gateway to your favorite music.
            </motion.p>
            
            {/* Main Hero Screenshot */}
            <motion.div 
              className="relative group max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-black rounded-2xl p-2 shadow-2xl">
                <img 
                  src="/landing/hero-main.png" 
                  alt="Album Grid Interface" 
                  className="w-full rounded-xl shadow-lg"
                />
              </div>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Album Modal Feature */}
            <motion.div 
              className="order-2 md:order-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div 
                className="relative group"
                transition={{ duration: 0.3 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-gray-900 rounded-2xl p-2 shadow-xl">
                  <img 
                    src="/landing/album-modal.png" 
                    alt="Album Modal Interface" 
                    className="w-full rounded-xl"
                  />
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="order-1 md:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.h3 
                className="text-3xl md:text-4xl font-bold mb-4 text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Dive Deep Into Albums
              </motion.h3>
              <motion.p 
                className="text-xl text-gray-300 mb-6 leading-relaxed"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                Click any album cover to explore your liked tracks from that album. 
                Beautiful modal windows with smooth animations make browsing a joy.
              </motion.p>
              <motion.div 
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <motion.span 
                  className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm"
                  whileHover={{ scale: 1.1 }}
                >Smooth Animations</motion.span>
                <motion.span 
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                  whileHover={{ scale: 1.1 }}
                >Albums Details on Hover</motion.span>
                <motion.span 
                  className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm"
                  whileHover={{ scale: 1.1 }}
                >One-Click Play</motion.span>
              </motion.div>
            </motion.div>

            {/* Player Feature */}
            <motion.div 
              className="order-3"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.h3 
                className="text-3xl md:text-4xl font-bold mb-4 text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Seamless Playback
              </motion.h3>
              <motion.p 
                className="text-xl text-gray-300 mb-6 leading-relaxed"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                Advanced music player with smart shuffle continuation. 
                When an album ends, your entire library keeps the music flowing.
              </motion.p>
              <motion.div 
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <motion.span 
                  className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm"
                  whileHover={{ scale: 1.1 }}
                >Smart Shuffle</motion.span>
                <motion.span 
                  className="px-3 py-1 bg-lime-500/20 text-lime-300 rounded-full text-sm"
                  whileHover={{ scale: 1.1 }}
                >Library Integration</motion.span>
                <motion.span 
                  className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm"
                  whileHover={{ scale: 1.1 }}
                >Never Stops</motion.span>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="order-4"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div 
                className="relative group"
                transition={{ duration: 0.3 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-lime-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-gray-900 rounded-2xl p-2 shadow-xl">
                  <img 
                    src="/landing/player-active.png" 
                    alt="Music Player Interface" 
                    className="w-full rounded-xl"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}