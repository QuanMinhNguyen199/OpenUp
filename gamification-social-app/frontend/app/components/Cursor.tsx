"use client";
import { useEffect } from "react";

export default function Cursor() {
    useEffect(() => {
        const dot = document.createElement("div");
        const ring = document.createElement("div");

        dot.className = "cursor-dot";
        ring.className = "cursor-ring";

        document.body.appendChild(dot);
        document.body.appendChild(ring);

        let mouseX = 0;
        let mouseY = 0;

        let ringX = 0;
        let ringY = 0;

        const speed = 0.15; // càng nhỏ càng delay nhiều (trail effect)

        const move = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // dot follow trực tiếp
            dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        };

        const animate = () => {
            // ring follow chậm hơn → tạo trail
            ringX += (mouseX - ringX) * speed;
            ringY += (mouseY - ringY) * speed;

            ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

            requestAnimationFrame(animate);
        };

        animate();
        window.addEventListener("mousemove", move);

        // hover effect
        const addHover = () => document.body.classList.add("cursor-hover");
        const removeHover = () => document.body.classList.remove("cursor-hover");

        const hoverables = document.querySelectorAll("a, button");

        hoverables.forEach((el) => {
            el.addEventListener("mouseenter", addHover);
            el.addEventListener("mouseleave", removeHover);
        });

        return () => {
            window.removeEventListener("mousemove", move);
            dot.remove();
            ring.remove();
        };
    }, []);

    return null;
}


// "use client";
// import { useEffect } from "react";

// export default function Cursor() {
//     useEffect(() => {
//         const dot = document.createElement("div");
//         dot.className = "cursor-dot";
//         document.body.appendChild(dot);

//         const move = (e: MouseEvent) => {
//             // dot.style.left = e.clientX + "px";
//             // dot.style.top = e.clientY + "px";
//             // dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
//         };

//         window.addEventListener("mousemove", move);
//         return () => window.removeEventListener("mousemove", move);
//     }, []);

//     return null;
// }