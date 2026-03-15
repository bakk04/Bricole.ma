"use client";

import { useEffect } from "react";

export default function GlobalInteractions() {
  useEffect(() => {
    const runInitializers = () => {
      const w = typeof window !== "undefined" ? window : undefined;
      if (!w) return;

      if (w.$) {
        w.$('[data-toggle="mobile-menu"]')
          .off("click.bricole")
          .on("click.bricole", function () {
            w.$("body").toggleClass("menu-open");
          });
      }

      if (w.L && w.document.getElementById("bricole-map")) {
        if (!w.__bricoleMap) {
          const el = w.document.getElementById("bricole-map");
          const map = w.L.map(el).setView([33.5731, -7.5898], 12);
          w.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
          }).addTo(map);
          w.__bricoleMap = map;
        }
      }
    };

    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then(() => {
          runInitializers();
        })
        .catch(() => {
          runInitializers();
        });
    } else {
      runInitializers();
    }
  }, []);

  return null;
}

