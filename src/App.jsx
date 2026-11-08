import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  VolumeX,
  Rocket,
  Sparkles,
  Play,
} from "lucide-react";

import "./App.css";

function App() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const mutedRef = useRef(false);
  const launchRef = useRef(null);
  const timerRef = useRef(null);

  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  // Audio initialization
  const getAudio = async () => {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return null;

    if (!audioRef.current) {
      audioRef.current = new AudioContext();
    }

    if (audioRef.current.state === "suspended") {
      await audioRef.current.resume();
    }

    return audioRef.current;
  };

  // Rocket launch sound

  // Explosion sound
 // Real firework explosion sound
const playExplosionSound = () => {
  if (mutedRef.current) return;

  const sound = new Audio("/audio.mp3");

  sound.volume = 0.8;

  sound.play().catch((error) => {
    console.log("Explosion sound error:", error);
  });
};
  // Fireworks canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let rockets = [];
    let particles = [];
    let stars = [];
    let animationId;

    const colors = [
      "#FFD700",
      "#FF4D6D",
      "#00E5FF",
      "#FF00FF",
      "#00FF88",
      "#FF8C00",
      "#FFFFFF",
    ];

    // Resize canvas
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    window.addEventListener("resize", resize);

    // Background stars
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.8,
        alpha: Math.random() * Math.PI,
      });
    }

    // Launch straight rocket
    const launchRocket = () => {
      const x =
        Math.random() *
          (window.innerWidth * 0.8) +
        window.innerWidth * 0.1;

      const targetY =
        Math.random() *
          (window.innerHeight * 0.45) +
        60;

      const color =
        colors[Math.floor(Math.random() * colors.length)];

      rockets.push({
        x,
        y: window.innerHeight + 20,
        targetY,
        vx: 0,
        vy: -(Math.random() * 3 + 8),
        color,
        trail: [],
      });
    };

    launchRef.current = launchRocket;

    // Explosion
    const explode = (x, y, color) => {
      for (let i = 0; i < 130; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 1;

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.7 ? "#FFD700" : color,
          life: 100,
          maxLife: 100,
          size: Math.random() * 3 + 1,
          gravity: 0.04,
        });
      }

      // White center sparks
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * 5,
          vy: Math.sin(angle) * 5,
          color: "#FFFFFF",
          life: 30,
          maxLife: 30,
          size: 2,
          gravity: 0.02,
        });
      }

      playExplosionSound();
    };

    // Draw a custom vertical rocket
    const drawRocket = (rocket) => {
      ctx.save();

      ctx.translate(rocket.x, rocket.y);

      // Rocket glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = rocket.color;

      // Rocket body
      ctx.fillStyle = "#F5F5F5";
      ctx.beginPath();
      ctx.roundRect(-5, -15, 10, 28, 5);
      ctx.fill();

      // Nose cone
      ctx.fillStyle = rocket.color;
      ctx.beginPath();
      ctx.moveTo(-5, -15);
      ctx.lineTo(0, -25);
      ctx.lineTo(5, -15);
      ctx.closePath();
      ctx.fill();

      // Window
      ctx.fillStyle = "#00D9FF";
      ctx.beginPath();
      ctx.arc(0, -7, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Left fin
      ctx.fillStyle = rocket.color;
      ctx.beginPath();
      ctx.moveTo(-5, 7);
      ctx.lineTo(-11, 16);
      ctx.lineTo(-5, 13);
      ctx.closePath();
      ctx.fill();

      // Right fin
      ctx.beginPath();
      ctx.moveTo(5, 7);
      ctx.lineTo(11, 16);
      ctx.lineTo(5, 13);
      ctx.closePath();
      ctx.fill();

      // Rocket flame
      ctx.shadowColor = "#FF8C00";
      ctx.fillStyle = "#FF8C00";

      ctx.beginPath();
      ctx.moveTo(-4, 13);
      ctx.lineTo(0, 25 + Math.random() * 8);
      ctx.lineTo(4, 13);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    // Animation
    const animate = () => {
      ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
      );

      // Stars
      stars.forEach((star) => {
        star.alpha += 0.02;

        ctx.globalAlpha =
          0.3 + Math.abs(Math.sin(star.alpha)) * 0.7;

        ctx.fillStyle = "#FFFFFF";

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      // Rockets
      const remainingRockets = [];

      rockets.forEach((rocket) => {
        rocket.trail.push({
          x: rocket.x,
          y: rocket.y,
        });

        if (rocket.trail.length > 15) {
          rocket.trail.shift();
        }

        // Rocket trail
        rocket.trail.forEach((point, index) => {
          ctx.globalAlpha = index / rocket.trail.length;
          ctx.fillStyle = rocket.color;

          ctx.beginPath();
          ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.globalAlpha = 1;

        drawRocket(rocket);

        rocket.x += rocket.vx;
        rocket.y += rocket.vy;
        rocket.vy += 0.045;

        if (rocket.y <= rocket.targetY) {
          explode(rocket.x, rocket.y, rocket.color);
        } else {
          remainingRockets.push(rocket);
        }
      });

      rockets = remainingRockets;

      // Particles
      particles = particles.filter((p) => p.life > 0);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.985;
        p.vy *= 0.985;

        p.vy += p.gravity;
        p.life--;

        ctx.globalAlpha = p.life / p.maxLife;

        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      clearInterval(timerRef.current);
      launchRef.current = null;
    };
  }, []);

  // Start celebration
 const celebrate = async () => {
  await getAudio();

  setStarted(true);

  clearInterval(timerRef.current);

  let count = 0;

  // Launch first rocket without sound
  launchRef.current?.();

  timerRef.current = setInterval(() => {
    launchRef.current?.();

    count++;

    if (count >= 30) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, 450);
};

  // Sound toggle
  const toggleSound = () => {
    const value = !muted;

    mutedRef.current = value;
    setMuted(value);
  };

  return (
    <main className="diwali-container">
      <canvas
        ref={canvasRef}
        className="fireworks-canvas"
      />

      {/* Top navigation */}
      <nav className="navbar">
       

        <button
          className="sound-control"
          onClick={toggleSound}
          aria-label="Toggle sound"
        >
          {muted ? <VolumeX /> : <Volume2 />}
          {muted ? "Sound Off" : "Sound On"}
        </button>
      </nav>

      {/* Main greeting */}
      <section className="hero">

        <motion.div
          className="diya-icon"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          🪔
        </motion.div>

        <motion.div
          className="eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✨ THE FESTIVAL OF LIGHTS ✨
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Happy <span>Diwali</span>
        </motion.h1>

        <motion.p
          className="greeting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          May the festival of lights brighten your life
          with endless joy, fill your heart with peace,
          and bring prosperity to your home.

          <br />

          May every diya light up a new hope and
          every firework bring a reason to smile.
        </motion.p>

        <motion.button
          className="launch-button"
          onClick={celebrate}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
        >
          {started ? <Rocket size={20} /> : <Play size={20} />}

          {started ? "Launch More Fireworks" : "Celebrate Diwali"}

          <Sparkles size={20} />
        </motion.button>

        {started && (
          <motion.div
            className="success-message"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✨ शुभ दीपावली ✨
            <br />
            Wishing you love, happiness and prosperity!
          </motion.div>
        )}

      </section>

      <footer className="footer">
        Made with ❤️ and lots of lights
      </footer>
    </main>
  );
}

export default App;