---
name: "2D Physics Engine"
slug: physics-engine
category: "Simulation and visualization"
status: published
developmentStatus: null
shortDescription: "An event-based collision simulation with a Go physics core and an interactive browser visualization."
longDescription: "A small simulation project connecting collision calculations in Go to a browser interface for changing object parameters and watching the resulting motion."
role: null
technologies: ["Go", "JavaScript", "Canvas", "WebSocket"]
impact: null
featured: true
accent: "red"
order: 2
repositoryKey: "physics-engine"
links:
  [
    {
      "label": "GitHub",
      "url": "https://github.com/koljaPl/2-squares-collapse",
      "kind": "repository",
    },
  ]
screenshots: []
customArtwork: null
seoDescription: "An event-based collision simulation with a Go physics core and an interactive browser visualization."
---

## Architecture

The Go physics package represents objects with position, velocity and mass, and supports circles and squares. The browser interface uses JavaScript and Canvas; the backend exposes a WebSocket route to deliver simulation states.

## Event-based simulation

Each step searches for the earliest future wall or object collision, advances all objects to that time, resolves the event, and continues through the remaining interval. Wall and object collision calculations are separated from the simulation loop.

The continuous mode uses a 60 Hz ticker as a scheduling interval. That is an implementation setting, not a measured performance result. Render-state snapshots are copied before delivery to the connection, and a full state channel can skip a frame rather than block the physics loop.

## Interaction and boundaries

The browser provides mass, velocity and shape controls, along with start/reset behavior. The repository includes collision and route tests, but these have not been run as part of this portfolio update. This is a focused simulation, not a claim of a general-purpose or production-validated physics engine.

## Source

[Repository and implementation](https://github.com/koljaPl/2-squares-collapse).
