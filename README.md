# Algebra Function Graph Simulator

**Explore algebra through interactive visualization.**

Algebra Function Graph Simulator is an interactive educational web application designed to visualize, calculate, and explain algebraic functions on the Cartesian coordinate plane in real time.

Built with HTML5, CSS3, and vanilla JavaScript, the application combines mathematical computation with interactive graph visualization in a premium, minimalist scientific interface.

The goal is simple: help users understand the relationship between algebraic expressions, input values, output values, and their corresponding positions on a Cartesian graph.

## ✨ Features

### Interactive Cartesian Plane
- Real-time visualization of algebraic functions.
- Interactive zooming and panning.
- Coordinate inspection through mouse hover.
- Dynamic point highlighting and coordinate display.
- Adjustable X-axis and Y-axis ranges.
- Toggleable grid lines and coordinate labels.

### Mathematical Expression Parser
- Custom Abstract Syntax Tree (AST)-based parser.
- No use of JavaScript's `eval()` for mathematical expression evaluation.
- Input validation and error handling for unsupported or invalid expressions.
- Support for explicit and implicit multiplication.

### Algebraic Function Support

Plot and explore a variety of mathematical expressions, including:

- **Basic algebra:** addition, subtraction, multiplication, division, and exponentiation.
- **Trigonometry:** `sin`, `cos`, `tan`, `asin`, `acos`, and `atan`.
- **Logarithms:** `log`, `ln`, `log2`, and `log10`.
- **Other mathematical functions:** `sqrt`, `abs`, `exp`, `floor`, and `ceil`.
- **Constants:** `pi` and `e`.

### Multiple Function Plotting
- Plot multiple functions on the same coordinate plane.
- Distinguish functions using different curve colors.
- Use a legend to identify plotted functions.
- Compare function behavior within the same coordinate range.

### Point Calculator
- Enter an X value to calculate its corresponding Y value.
- Display the resulting coordinate pair \((x,y)\).
- Show the substitution process step by step.
- Highlight the calculated point directly on the graph.

### Premium Loading Experience
- Animated Cartesian grid and function curve.
- Elegant progress indicator and initialization messages.
- Smooth transition into the main application.
- Visual styling consistent with the application's scientific identity.

### Responsive Interface
- Designed for desktop, tablet, and mobile screens.
- Clean dashboard layout with intuitive graph controls.
- Smooth transitions and restrained visual effects.

## 🎨 Design System

The interface follows a **minimalist, premium scientific aesthetic**, combining dark surfaces with cool-toned accents for clarity and visual consistency.

| Color | Hex | Usage |
|---|---|---|
| Charcoal | `#20252D` | Primary background and dark surfaces |
| Light Cool Gray | `#DCE2E8` | Secondary text, borders, and supporting elements |
| Ice Blue | `#BFE8FF` | Highlights and subtle accents |
| Electric Blue | `#2979FF` | Function curves, primary actions, and interactive elements |
| White | `#F8FAFC` | Primary text and high-contrast content |

The design prioritizes mathematical readability, clear visual hierarchy, and a distraction-free learning experience.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic structure and application layout |
| CSS3 | Responsive styling, layout, and animations |
| JavaScript ES6+ | Mathematical calculations, parsing, and interaction logic |
| HTML Canvas | Cartesian plane and function rendering |
| SVG / CSS Animations | Lightweight visual effects and loading animations |

**Architecture:** Frontend-only application with no required backend or build process.

The core application uses vanilla JavaScript without a frontend framework.

## 🚀 Getting Started

### Prerequisites

- A modern web browser, such as Chrome, Firefox, Edge, or Safari.
- No backend, package installation, or build tools are required for the basic application.

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd Algebra-Function-Graph-Simulator
   ```

3. Ensure the following files are present in the same directory:

   ```text
   index.html
   style.css
   script.js
   ```

4. Open `index.html` in your browser.

   Alternatively, use the **Live Server** extension in Visual Studio Code for a convenient local development workflow.

## 📐 Supported Mathematical Syntax

### Variables and Constants

| Expression | Meaning |
|---|---|
| `x` | Independent variable |
| `pi` | Mathematical constant π |
| `e` | Euler's number |

### Arithmetic Operators

| Operator | Operation | Example |
|---|---|---|
| `+` | Addition | `x + 3` |
| `-` | Subtraction | `x - 4` |
| `*` | Multiplication | `2*x` |
| `/` | Division | `1/x` |
| `^` | Exponentiation | `x^2` |

Implicit multiplication is also supported where recognized by the parser, such as `2x` and `2(x + 1)`.

### Mathematical Functions

| Category | Supported expressions |
|---|---|
| Trigonometry | `sin(x)`, `cos(x)`, `tan(x)` |
| Inverse trigonometry | `asin(x)`, `acos(x)`, `atan(x)` |
| Logarithms | `log(x)`, `ln(x)`, `log2(x)`, `log10(x)` |
| Roots and magnitude | `sqrt(x)`, `abs(x)` |
| Exponential | `exp(x)` |
| Rounding | `floor(x)`, `ceil(x)` |

**Note:** The exact supported syntax depends on the parser implementation. Some expressions may be mathematically valid but rejected if they are not implemented by the application.

## 🧮 Example Functions

Try the following expressions in the function input field.

| Function | Example input | Function type |
|---|---|---|
| Linear | `y = 2x + 3` | Straight line |
| Quadratic | `y = x^2 - 4` | Parabola |
| Trigonometric | `y = sin(x)` | Periodic curve |
| Logarithmic | `y = log(x)` | Logarithmic curve |
| Square root | `y = sqrt(abs(x))` | Root function |

### Example Calculation

Given the function:

\[
y = x^2 - 4
\]

If the input is \(x = 3\), the application calculates:

\[
\begin{aligned}
y &= 3^2 - 4 \\
  &= 9 - 4 \\
  &= 5
\end{aligned}
\]

The resulting coordinate is:

\[
\boxed{(3,5)}
\]

The application highlights the corresponding point on the Cartesian plane, connecting the numerical calculation to its graphical representation.

## 📂 Project Structure

```text
Algebra-Function-Graph-Simulator/
├── index.html    # Application structure and interface
├── style.css     # Visual design, responsive layout, and animations
└── script.js     # Mathematical parser, graph engine, and application logic
```

### Core Components

- **Math Parser:** Processes mathematical expressions and evaluates supported operations.
- **Graph Engine:** Converts mathematical coordinates into Canvas positions and renders function curves.
- **Point Calculator:** Computes Y values from user-provided X values and prepares calculation steps.
- **Application Controller:** Coordinates user inputs, graph updates, controls, and interface state.

These descriptions represent the intended responsibilities of the modules; the actual implementation may organize them differently within the JavaScript file.

## 🔒 Security and Input Validation

The mathematical expression parser is designed to evaluate supported mathematical syntax without using `eval()`.

Input validation helps prevent unsupported expressions from being processed as valid mathematical functions.

A custom parser reduces the risks associated with executing arbitrary JavaScript, although overall security still depends on correct parsing, evaluation, and rendering implementations.

## 🎯 Project Goals

This project aims to:

- Make algebraic functions easier to understand through visual learning.
- Demonstrate the relationship between equations and Cartesian coordinates.
- Provide an interactive environment for mathematical exploration.
- Combine mathematical logic, graphical rendering, and user interface design in a browser-based application.

## 🔮 Potential Improvements

Possible future enhancements include:

- Function intersection detection.
- Root and X-intercept identification.
- Local maxima and minima analysis.
- Derivative visualization and tangent lines.
- Function comparison and saved experiments.
- Exporting graphs as PNG images.
- Additional mathematical functions and configurable graph themes.

These are potential future features, not claims about the current implementation.
