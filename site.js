const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "فتح القائمة" : "إغلاق القائمة");
    navLinks.classList.toggle("open", !isOpen);
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "فتح القائمة");
      navLinks.classList.remove("open");
    }
  });
}

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

if (!reducedMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("motion-ready");
  const targets = document.querySelectorAll(".reveal, .section-heading, .content-card, .info-panel, .faq-list details, .contact-option, .cta-box");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
  targets.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
    revealObserver.observe(element);
  });
}

const progress = document.querySelector(".scroll-progress");
if (progress) {
  let frame = 0;
  const updateProgress = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0})`;
      frame = 0;
    });
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
}

const hero = document.querySelector(".home-hero, .page-hero");
const spot = document.querySelector(".hero-spot");
if (hero && spot) {
  hero.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const bounds = hero.getBoundingClientRect();
    spot.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
    spot.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
  }, { passive: true });
}

if (finePointer && !reducedMotion) {
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");
  if (cursorDot && cursorRing) {
    document.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      document.documentElement.classList.add("custom-cursor-ready");
      const point = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      cursorDot.style.transform = point;
      cursorRing.style.transform = point;
    }, { passive: true });
    document.addEventListener("pointerover", (event) => {
      if (event.target.closest("a,button,summary")) document.documentElement.classList.add("cursor-hover");
    });
    document.addEventListener("pointerout", (event) => {
      if (event.target.closest("a,button,summary")) document.documentElement.classList.remove("cursor-hover");
    });
  }

  document.querySelectorAll(".button").forEach((button) => {
    button.classList.add("is-magnetic");
    button.addEventListener("pointermove", (event) => {
      const bounds = button.getBoundingClientRect();
      button.style.setProperty("--mag-x", `${((event.clientX - bounds.left - bounds.width / 2) * 0.12).toFixed(1)}px`);
      button.style.setProperty("--mag-y", `${((event.clientY - bounds.top - bounds.height / 2) * 0.12).toFixed(1)}px`);
    });
    button.addEventListener("pointerleave", () => {
      button.style.setProperty("--mag-x", "0px");
      button.style.setProperty("--mag-y", "0px");
    });
  });

  document.querySelectorAll(".content-card").forEach((card) => {
    card.classList.add("tilt-card");
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const details = String(formData.get("details") || "").trim();
    const status = document.querySelector("#form-status");
    if (!name || !details) {
      status.textContent = "اكتب اسمك ونبذة عن مشروعك قبل الإرسال.";
      return;
    }
    const message = `مرحباً 3LIDEV، أنا ${name}. أريد الاستفسار عن: ${details}`;
    window.open(`https://wa.me/201556882718?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    status.textContent = "تم تجهيز رسالتك في واتساب.";
  });
}

if (!reducedMotion) {
  document.querySelectorAll(".hero-particles").forEach((canvas) => {
    const context = canvas.getContext("2d");
    const section = canvas.parentElement;
    if (!context || !section) return;
    let particles = [];
    let frame = 0;
    let active = true;
    const pointer = { x: -1000, y: -1000 };

    const resize = () => {
      const bounds = section.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * ratio);
      canvas.height = Math.round(bounds.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(78, Math.max(28, Math.round(bounds.width * bounds.height / 20000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * bounds.width,
        y: Math.random() * bounds.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        radius: Math.random() * 1.3 + 0.4,
        alpha: Math.random() * 0.4 + 0.16
      }));
    };

    const draw = () => {
      if (!active || document.hidden) { frame = 0; return; }
      const bounds = section.getBoundingClientRect();
      context.clearRect(0, 0, bounds.width, bounds.height);
      particles.forEach((particle, index) => {
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const distanceToPointer = Math.hypot(dx, dy);
        if (distanceToPointer < 110 && distanceToPointer > 0) {
          particle.vx += dx / distanceToPointer * 0.002;
          particle.vy += dy / distanceToPointer * 0.002;
        }
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.998;
        particle.vy *= 0.998;
        if (particle.x < 0 || particle.x > bounds.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > bounds.height) particle.vy *= -1;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(198,165,223,${particle.alpha})`;
        context.fill();
        for (let next = index + 1; next < particles.length; next += 1) {
          const other = particles[next];
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (distance < 100) {
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.strokeStyle = `rgba(164,132,195,${(1 - distance / 100) * 0.13})`;
            context.stroke();
          }
        }
      });
      frame = requestAnimationFrame(draw);
    };

    section.addEventListener("pointermove", (event) => {
      const bounds = section.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
    }, { passive: true });
    section.addEventListener("pointerleave", () => { pointer.x = -1000; pointer.y = -1000; });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && active && !frame) frame = requestAnimationFrame(draw);
    });
    new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active && !frame) frame = requestAnimationFrame(draw);
      else if (!active && frame) { cancelAnimationFrame(frame); frame = 0; }
    }).observe(section);
    resize();
    frame = requestAnimationFrame(draw);
  });
}

const hologramCanvas = document.querySelector(".hero-3d");
if (hologramCanvas) {
  const context = hologramCanvas.getContext("2d");
  const stage = hologramCanvas.closest(".hero-stage");
  const tabs = [...document.querySelectorAll(".hud-tab")];
  const stageName = document.querySelector(".stage-name");
  const stageNumber = document.querySelector(".stage-caption-number");

  if (context && stage && tabs.length) {
    const colors = {
      cube: [211, 183, 238],
      identity: [217, 184, 245],
      code: [193, 176, 236],
      systems: [224, 187, 225],
      world: [179, 187, 231]
    };
    const seeded = (index, salt = 0) => {
      const value = Math.sin((index + 1) * 127.1 + (salt + 1) * 311.7) * 43758.5453;
      return value - Math.floor(value);
    };
    const pointsAlongPaths = (paths, count, depth = 0.22) => {
      const segments = [];
      let totalLength = 0;
      paths.forEach((path, pathIndex) => {
        for (let index = 0; index < path.length - 1; index += 1) {
          const start = path[index];
          const end = path[index + 1];
          const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
          segments.push({ start, end, length, offset: totalLength, path: pathIndex });
          totalLength += length;
        }
      });
      return Array.from({ length: count }, (_, index) => {
        const distance = ((index + seeded(index, 1) * 0.7) / count) * totalLength;
        const segment = segments.find((item) => distance <= item.offset + item.length) || segments[segments.length - 1];
        const amount = Math.max(0, Math.min(1, (distance - segment.offset) / segment.length));
        return {
          x: segment.start[0] + (segment.end[0] - segment.start[0]) * amount,
          y: segment.start[1] + (segment.end[1] - segment.start[1]) * amount,
          z: (seeded(index, 2) - 0.5) * depth,
          path: segment.path
        };
      });
    };

    const createShape = (name, count = 760) => {
      if (name === "identity") {
        return pointsAlongPaths([
          [[-.58, -.52], [-.28, -.52], [-.13, -.4], [-.13, -.27], [-.43, -.04], [-.15, .1], [-.13, .22], [-.13, .37], [-.29, .49], [-.58, .49]],
          [[.13, -.52], [.13, .47], [.56, .47]]
        ], count, .12);
      }
      if (name === "code") {
        return pointsAlongPaths([
          [[-.64, .29], [-.64, -.58], [.64, -.58], [.64, .29]],
          [[-.76, .42], [.76, .42], [.59, .58], [-.59, .58], [-.76, .42]],
          [[-.45, -.4], [-.17, -.4]],
          [[-.05, -.4], [.42, -.4]],
          [[-.45, -.21], [.08, -.21]],
          [[.2, -.21], [.45, -.21]],
          [[-.45, -.02], [-.22, -.02]],
          [[-.1, -.02], [.45, -.02]],
          [[-.45, .17], [.23, .17]],
          [[.35, .17], [.45, .17]]
        ], count, .08);
      }
      if (name === "systems") {
        return pointsAlongPaths([
          [[-.61, -.69], [.61, -.69], [.61, -.31], [-.61, -.31], [-.61, -.69]],
          [[-.61, -.19], [.61, -.19], [.61, .19], [-.61, .19], [-.61, -.19]],
          [[-.61, .31], [.61, .31], [.61, .69], [-.61, .69], [-.61, .31]],
          [[-.37, -.5], [.22, -.5]],
          [[-.37, 0], [.22, 0]],
          [[-.37, .5], [.22, .5]]
        ], count, .08);
      }
      if (name === "cube") {
        return Array.from({ length: count }, (_, index) => {
          const point = [0, 0, 0];
          if (index % 10 < 6) {
            const edge = Math.floor(seeded(index, 20) * 12);
            const axis = Math.floor(edge / 4);
            const freeAxis = (axis + 1 + edge % 2) % 3;
            const fixedAxis = 3 - axis - freeAxis;
            point[axis] = (seeded(index, 21) - .5) * 1.18;
            point[freeAxis] = edge % 2 ? -.59 : .59;
            point[fixedAxis] = Math.floor(edge % 4 / 2) ? .59 : -.59;
          } else {
            const face = Math.floor(seeded(index, 22) * 6);
            const axis = Math.floor(face / 2);
            point[axis] = face % 2 ? .59 : -.59;
            point[(axis + 1) % 3] = (seeded(index, 23) - .5) * 1.16;
            point[(axis + 2) % 3] = (seeded(index, 24) - .5) * 1.16;
          }
          return {
            x: point[0] + (seeded(index, 25) - .5) * .035,
            y: point[1] + (seeded(index, 26) - .5) * .035,
            z: point[2] + (seeded(index, 27) - .5) * .035,
            path: index % 10 < 6 ? 1 : 0
          };
        });
      }
      const spherePoints = [];
      const latitudeCount = 8;
      const latitudeSegments = 48;
      for (let latitude = 0; latitude < latitudeCount; latitude += 1) {
        const angle = -Math.PI * .5 + Math.PI * (latitude + 1) / (latitudeCount + 1);
        const ringRadius = Math.cos(angle) * .7;
        const ringY = Math.sin(angle) * .7;
        for (let segment = 0; segment < latitudeSegments; segment += 1) {
          const longitude = segment / latitudeSegments * Math.PI * 2;
          spherePoints.push({
            x: Math.cos(longitude) * ringRadius,
            y: ringY,
            z: Math.sin(longitude) * ringRadius,
            path: latitude
          });
        }
      }
      const longitudeCount = 12;
      const longitudeSegments = 31;
      for (let longitudeIndex = 0; longitudeIndex < longitudeCount; longitudeIndex += 1) {
        const longitude = longitudeIndex / longitudeCount * Math.PI * 2;
        for (let segment = 0; segment < longitudeSegments; segment += 1) {
          const latitude = -Math.PI * .5 + Math.PI * segment / (longitudeSegments - 1);
          const ringRadius = Math.cos(latitude) * .7;
          spherePoints.push({
            x: Math.cos(longitude) * ringRadius,
            y: Math.sin(latitude) * .7,
            z: Math.sin(longitude) * ringRadius,
            path: latitudeCount + longitudeIndex
          });
        }
      }
      while (spherePoints.length < count) {
        spherePoints.push({ x: 0, y: 0, z: 0, path: longitudeCount + latitudeCount });
      }
      return spherePoints.slice(0, count);
    };

    const shapeNames = tabs.map((tab) => tab.dataset.shape);
    let activeShape = tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.shape || shapeNames[0];
    const initialTab = tabs.find((tab) => tab.dataset.shape === activeShape);
    if (initialTab) {
      if (stageName) stageName.textContent = initialTab.dataset.name || "";
      if (stageNumber) {
        const selectedIndex = tabs.indexOf(initialTab) + 1;
        stageNumber.textContent = `${String(selectedIndex).padStart(2, "0")} / ${String(tabs.length).padStart(2, "0")}`;
      }
    }
    let fromPoints = createShape(activeShape);
    let targetPoints = fromPoints;
    let transitionStarted = 0;
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let pointerX = 0;
    let pointerY = 0;
    let dragRotation = 0;
    let dragTilt = 0;
    let activePointer = null;
    let pointerDownAt = null;
    let flashStarted = 0;
    let flashPoint = { x: 0, y: 0 };
    let interactionPoint = { x: -1000, y: -1000 };
    let interactionStarted = 0;
    let interactionStrength = 0;
    const motes = Array.from({ length: 48 }, (_, index) => ({
      offset: seeded(index, 4),
      sway: seeded(index, 5) * 2 - 1,
      size: .7 + seeded(index, 6) * 1.5
    }));

    const resize = () => {
      const bounds = stage.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      hologramCanvas.width = Math.round(width * ratio);
      hologramCanvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      render(performance.now());
    };

    const polygon = (points, fill, stroke, lineWidth = 1) => {
      context.beginPath();
      context.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => context.lineTo(x, y));
      context.closePath();
      if (fill) { context.fillStyle = fill; context.fill(); }
      if (stroke) { context.strokeStyle = stroke; context.lineWidth = lineWidth; context.stroke(); }
    };

    const roundedBox = (x, y, boxWidth, boxHeight, radius) => {
      context.beginPath();
      context.roundRect(x, y, boxWidth, boxHeight, radius);
    };

    const render = (time) => {
      if (!width || !height) return;
      context.clearRect(0, 0, width, height);
      const centerX = width * .5 + pointerX * 7;
      const objectY = height * .56 + pointerY * 4 + Math.sin(time * .0011) * (reducedMotion ? 0 : 3);
      const scale = Math.min(width * .5, height * .35);
      const baseY = height * .78;
      const [red, green, blue] = colors[activeShape];
      const phase = dragRotation + (reducedMotion ? 0 : time * .0002);
      const transition = reducedMotion ? 1 : Math.min(1, (time - transitionStarted) / 850);
      const eased = transition * transition * (3 - 2 * transition);

      const aura = context.createRadialGradient(centerX, objectY, scale * .08, centerX, objectY, scale * 1.05);
      aura.addColorStop(0, `rgba(${red},${green},${blue},.09)`);
      aura.addColorStop(1, `rgba(${red},${green},${blue},0)`);
      context.fillStyle = aura;
      context.beginPath();
      context.ellipse(centerX, objectY, scale * .92, scale * .94, 0, 0, Math.PI * 2);
      context.fill();

      const beam = context.createLinearGradient(centerX, objectY - scale * .8, centerX, baseY);
      beam.addColorStop(0, `rgba(${red},${green},${blue},.012)`);
      beam.addColorStop(.55, `rgba(${red},${green},${blue},.02)`);
      beam.addColorStop(1, `rgba(${red},${green},${blue},.075)`);
      polygon([
        [centerX - scale * .12, objectY - scale * .72],
        [centerX + scale * .12, objectY - scale * .72],
        [centerX + scale * .94, baseY + 13],
        [centerX - scale * .94, baseY + 13]
      ], beam);

      const horizon = height * .72;
      const floorFade = context.createLinearGradient(0, horizon, 0, height);
      floorFade.addColorStop(0, `rgba(${red},${green},${blue},.015)`);
      floorFade.addColorStop(1, `rgba(${red},${green},${blue},.16)`);
      context.strokeStyle = floorFade;
      context.lineWidth = 1;
      for (let index = 0; index < 13; index += 1) {
        const spread = index / 12;
        const x = centerX + (spread - .5) * width * 1.65;
        context.beginPath();
        context.moveTo(centerX + (x - centerX) * .05, horizon);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let index = 0; index < 6; index += 1) {
        const progress = index / 5;
        const y = horizon + (height - horizon) * progress * progress;
        context.globalAlpha = .25 + progress * .45;
        context.beginPath();
        context.moveTo(width * .04, y);
        context.lineTo(width * .96, y);
        context.stroke();
      }
      context.globalAlpha = 1;

      for (let index = 0; index < 58; index += 1) {
        const x = seeded(index, 31) * width;
        const y = horizon + seeded(index, 32) * (height - horizon);
        const pulse = .35 + (Math.sin(time * .001 + index * 1.7) + 1) * .2;
        const size = index % 7 === 0 ? 2.2 : 1.15;
        context.globalAlpha = pulse;
        context.fillStyle = `rgba(${red},${green},${blue},.72)`;
        if (index % 4 === 0) {
          context.beginPath();
          context.arc(x, y, size, 0, Math.PI * 2);
          context.strokeStyle = `rgba(${red},${green},${blue},.8)`;
          context.lineWidth = .8;
          context.stroke();
        } else {
          context.fillRect(x, y, size * 1.7, size * .85);
        }
      }
      context.globalAlpha = 1;

      motes.forEach((mote) => {
        const travel = (mote.offset + time * .000075) % 1;
        const x = centerX + Math.sin(travel * 9 + mote.offset * 19) * scale * (.12 + travel * .55) + mote.sway * scale * .16;
        const y = baseY - travel * (baseY - objectY + scale * .5);
        const alpha = (1 - travel) * .2;
        context.beginPath();
        context.arc(x, y, mote.size * (.65 + travel * .6), 0, Math.PI * 2);
        context.fillStyle = `rgba(${red},${green},${blue},${alpha})`;
        context.fill();
      });

      const points = targetPoints.map((point, index) => {
        const start = fromPoints[index];
        let x = start.x + (point.x - start.x) * eased;
        let y = start.y + (point.y - start.y) * eased;
        let z = start.z + (point.z - start.z) * eased;
        const rotation = phase + Math.sin(time * .00045) * .035;
        const rotatedX = x * Math.cos(rotation) - z * Math.sin(rotation);
        z = x * Math.sin(rotation) + z * Math.cos(rotation);
        const tilt = .12 + pointerY * .08 + dragTilt + Math.sin(time * .00065) * (reducedMotion ? 0 : .045);
        const rotatedY = y * Math.cos(tilt) - z * Math.sin(tilt);
        z = y * Math.sin(tilt) + z * Math.cos(tilt);
        const perspective = 3.2 / (3.2 - z);
        return {
          x: centerX + rotatedX * scale * perspective,
          y: objectY + rotatedY * scale * perspective,
          z,
          path: point.path,
          alpha: Math.min(1, .36 + (z + .8) * .34 + (activeShape === "cube" && point.path ? .2 : 0))
        };
      });
      const interactionAge = time - interactionStarted;
      const interactionFade = reducedMotion ? 0 : Math.max(0, 1 - interactionAge / 1150) * interactionStrength;
      points.forEach((point, index) => {
        const dx = point.x - interactionPoint.x;
        const dy = point.y - interactionPoint.y;
        const distance = Math.hypot(dx, dy);
        const influence = Math.max(0, 1 - distance / Math.max(95, scale * .85)) * interactionFade;
        const spread = influence * (24 + (index % 7) * 3);
        const grainX = point.x + (distance ? dx / distance : 0) * spread;
        const grainY = point.y + (distance ? dy / distance : -1) * spread;
        const pulse = .82 + Math.sin(time * .0015 + index * .7) * .14;
        const cubeEdge = activeShape === "cube" && point.path === 1;
        context.beginPath();
        context.arc(grainX, grainY, (cubeEdge ? 2.3 : index % 9 === 0 ? 2.2 : 1.25 + seeded(index, 8) * .8) * pulse, 0, Math.PI * 2);
        context.fillStyle = `rgba(${red},${green},${blue},${Math.max(.58, point.alpha)})`;
        context.shadowBlur = cubeEdge || index % 13 === 0 ? 6 : 0;
        context.shadowColor = `rgb(${red},${green},${blue})`;
        context.fill();
      });
      context.shadowBlur = 0;

      const flash = Math.min(1, Math.max(0, 1 - (time - flashStarted) / 650));
      if (flash > 0) {
        const radius = (1 - flash) * scale * .48;
        context.beginPath();
        context.arc(flashPoint.x, flashPoint.y, radius, 0, Math.PI * 2);
        context.strokeStyle = `rgba(${red},${green},${blue},${flash * .8})`;
        context.lineWidth = 2;
        context.shadowColor = `rgb(${red},${green},${blue})`;
        context.shadowBlur = 12 * flash;
        context.stroke();
        context.shadowBlur = 0;
      }

      const ringPulse = reducedMotion ? 0 : Math.sin(time * .0012) * 3;
      [1, .77, .54].forEach((factor, index) => {
        context.beginPath();
        context.ellipse(centerX, baseY + index * 3, scale * (.85 * factor) + ringPulse, 9 + index * 2, 0, 0, Math.PI * 2);
        context.strokeStyle = `rgba(${red},${green},${blue},${.3 - index * .065})`;
        context.lineWidth = 1;
        context.stroke();
      });

      const boardWidth = Math.min(width * .62, 270);
      const boardHeight = 37;
      const boardTop = baseY - 5;
      context.save();
      context.shadowColor = `rgba(${red},${green},${blue},.45)`;
      context.shadowBlur = 24;
      roundedBox(centerX - boardWidth * .46, boardTop + 8, boardWidth * .92, boardHeight, 7);
      context.fillStyle = "rgba(30,23,38,.97)";
      context.fill();
      context.restore();
      polygon([
        [centerX - boardWidth * .5, boardTop + 8],
        [centerX + boardWidth * .5, boardTop + 8],
        [centerX + boardWidth * .43, boardTop + boardHeight + 8],
        [centerX - boardWidth * .43, boardTop + boardHeight + 8]
      ], "rgba(43,32,54,.98)", `rgba(${red},${green},${blue},.82)`, 1.2);
      context.strokeStyle = `rgba(${red},${green},${blue},.55)`;
      for (let index = 0; index < 13; index += 1) {
        const pinX = centerX - boardWidth * .39 + index * boardWidth * .78 / 12;
        [boardTop + 1, boardTop + boardHeight + 9].forEach((pinY, row) => {
          context.beginPath();
          context.moveTo(pinX, pinY);
          context.lineTo(pinX, pinY + (row === 0 ? -8 : 8));
          context.stroke();
        });
      }
      context.fillStyle = "#f1eaf6";
      context.font = "700 11px Segoe UI, Tahoma, sans-serif";
      context.textAlign = "center";
      context.direction = "ltr";
      context.fillText("3LIDEV", centerX, boardTop + 29);
      context.fillStyle = `rgba(${red},${green},${blue},.78)`;
      context.font = "8px Segoe UI, Tahoma, sans-serif";
      context.fillText("DIGITAL STUDIO", centerX, boardTop + 43);

      if (!reducedMotion && (transition < 1 || flash > .01 || interactionFade > .01)) requestFrame();
      if (!reducedMotion && visible) requestFrame();
    };

    const requestFrame = () => {
      if (!frame) frame = requestAnimationFrame((time) => {
        frame = 0;
        render(time);
      });
    };
    const selectShape = (tab) => {
      const nextShape = tab.dataset.shape;
      if (!nextShape || nextShape === activeShape) return;
      fromPoints = targetPoints.map((point, index) => {
        const start = fromPoints[index];
        const progress = reducedMotion ? 1 : Math.min(1, (performance.now() - transitionStarted) / 850);
        const eased = progress * progress * (3 - 2 * progress);
        return {
          x: start.x + (point.x - start.x) * eased,
          y: start.y + (point.y - start.y) * eased,
          z: start.z + (point.z - start.z) * eased
        };
      });
      activeShape = nextShape;
      targetPoints = createShape(activeShape);
      transitionStarted = performance.now();
      tabs.forEach((item) => {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      if (stageName) stageName.textContent = tab.dataset.name || "";
      if (stageNumber) {
        const selectedIndex = tabs.indexOf(tab) + 1;
        stageNumber.textContent = `${String(selectedIndex).padStart(2, "0")} / ${String(tabs.length).padStart(2, "0")}`;
      }
      render(performance.now());
      requestFrame();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectShape(tab));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const nextIndex = event.key === "Home" ? 0
          : event.key === "End" ? tabs.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
        selectShape(tabs[nextIndex]);
      });
    });

    hologramCanvas.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      activePointer = event.pointerId;
      pointerDownAt = {
        x: event.clientX,
        y: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        distance: 0
      };
      const canvasBounds = hologramCanvas.getBoundingClientRect();
      interactionPoint = { x: event.clientX - canvasBounds.left, y: event.clientY - canvasBounds.top };
      interactionStarted = performance.now();
      interactionStrength = 1;
      requestFrame();
      hologramCanvas.classList.add("is-dragging");
      hologramCanvas.setPointerCapture(event.pointerId);
    });
    hologramCanvas.addEventListener("pointermove", (event) => {
      if (event.pointerId !== activePointer || !pointerDownAt) return;
      const deltaX = event.clientX - pointerDownAt.lastX;
      const deltaY = event.clientY - pointerDownAt.lastY;
      pointerDownAt.distance += Math.hypot(deltaX, deltaY);
      pointerDownAt.lastX = event.clientX;
      pointerDownAt.lastY = event.clientY;
      const bounds = hologramCanvas.getBoundingClientRect();
      interactionPoint = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      interactionStarted = performance.now();
      interactionStrength = .8;
      requestFrame();
      if (Math.abs(deltaX) > 0) {
        dragRotation += deltaX * .009;
        requestFrame();
      }
      if (Math.abs(deltaY) > 0) {
        dragTilt = Math.max(-.55, Math.min(.55, dragTilt + deltaY * .006));
        requestFrame();
      }
    });
    const finishCanvasPointer = (event) => {
      if (event.pointerId !== activePointer || !pointerDownAt) return;
      const bounds = hologramCanvas.getBoundingClientRect();
      flashPoint = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      flashStarted = performance.now();
      if (pointerDownAt.distance < 10) {
        const selectedIndex = tabs.findIndex((tab) => tab.dataset.shape === activeShape);
        selectShape(tabs[(selectedIndex + 1) % tabs.length]);
      } else {
        requestFrame();
      }
      activePointer = null;
      pointerDownAt = null;
      hologramCanvas.classList.remove("is-dragging");
      requestFrame();
    };
    hologramCanvas.addEventListener("pointerup", finishCanvasPointer);
    hologramCanvas.addEventListener("pointercancel", () => {
      activePointer = null;
      pointerDownAt = null;
      hologramCanvas.classList.remove("is-dragging");
    });

    stage.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" || reducedMotion) return;
      const bounds = stage.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width - .5;
      pointerY = (event.clientY - bounds.top) / bounds.height - .5;
      requestFrame();
    }, { passive: true });
    stage.addEventListener("pointerleave", () => { pointerX = 0; pointerY = 0; });

    window.addEventListener("resize", resize);
    if (!reducedMotion && "IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) requestFrame();
        else if (frame) { cancelAnimationFrame(frame); frame = 0; }
      }).observe(stage);
    }
    resize();
    requestFrame();
  }
}
