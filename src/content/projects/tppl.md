---
name: "The Pseudo Programming Language"
slug: tppl
category: "Programming Language for Competetive Programming"
status: published
developmentStatus: "Active"
shortDescription: "A contest-oriented language with a typed compiler pipeline that lowers a supported subset to C++20."
longDescription: "TPPL keeps contest code focused on the problem: compact syntax passes through lexical, syntactic and semantic analysis before lowering to C++20. The current implementation is a deliberately small alpha."
role: null
technologies: ["C++20", "CMake", "TPPL"]
impact: null
featured: true
accent: "blue"
order: 1
repositoryKey: "tppl"
links:
  [
    {
      "label": "GitHub",
      "url": "https://github.com/koljaPl/pseudo-programming-language",
      "kind": "repository",
    },
  ]
screenshots: []
customArtwork:
  {
    "src": "/projects/tppl.webp",
    "alt": "TPPL monogram and The Pseudo Programming Language title",
    "caption": "Project artwork supplied by Nicklas.",
    "kind": "artwork",
    "width": 1262,
    "height": 733,
    "sources": [],
  }
seoDescription: "A contest-oriented language with a typed compiler pipeline that lowers a supported subset to C++20."
---

## Context and approach

TPPL is designed for competitive programming. Its source files use the `.tpp` extension, with a compiler frontend responsible for names, types and control flow before code generation.

## Compiler architecture

The pipeline proceeds from lexer and parser through declaration collection, name resolution, type checking and control-flow checking. A lowering stage prepares the program for a C++20 backend. Compiler diagnostics and the runtime live in separate parts of the repository.

The CLI's `--emit-cpp` mode writes C++ source. Compiling that output with `g++` is a separate step; the CLI does not silently execute the generated program.

## Implemented scope

The documented end-to-end subset includes integers, booleans, characters, strings, recursive vectors, top-level functions and recursion, initialized local variables, expressions, assignments, conditionals, while loops, ranges, for-each loops, checked indexing and runtime I/O.

## Current boundaries

Globals, nested functions and uninitialized locals reach the frontend but are rejected by the C++ backend. User-defined records, classes and enums, fixed-size arrays, maps, sets and a broader algorithm library remain outside the implemented subset. The version-goals document is a roadmap, not a list of completed features.

The repository contains frontend, semantic, lowering, code-generation and runtime tests. They were inspected as project evidence, not executed for this portfolio update; no test or performance result is claimed here.

## Source

[Repository and implementation](https://github.com/koljaPl/pseudo-programming-language).
