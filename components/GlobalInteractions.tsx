"use client";

import React, { useEffect } from "react";

const GlobalInteractions: React.FC = () => {
  useEffect(() => {
    const runInitializers = () => {
      if (typeof window === "undefined") return;

      const w = window;

      if (w.$) {
        w.$('[data-toggle="mobile-menu"]')
          .off("click.bricole")
          .on("click.bricole", function (this: any) {
            w.$("body").toggleClass("menu-open");
          });
      }

      if (w.L && w.document.getElementById("bricole-map")) {
        if (!w.__bricoleMap) {
          const el = w.document.getElementById("bricole-map");
          if (el) {
            const map = w.L.map(el).setView([33.5731, -7.5898], 12);
            w.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: "&copy; OpenStreetMap contributors",
            }).addTo(map);
            w.__bricoleMap = map;
          }
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
};

export default GlobalInteractions;
