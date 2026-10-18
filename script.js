class MathParser {
  static MATH_FUNCTIONS = new Set([
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "sqrt",
    "log",
    "log10",
    "log2",
    "ln",
    "abs",
    "exp",
    "floor",
    "ceil",
  ]);

  constructor(expr) {
    let sanitized = expr.replace(/\s+/g, "").toLowerCase();
    if (/\+\+|--|\+-|-\+/.test(sanitized)) {
      throw new Error("Invalid expression: consecutive '+' or '-' operators");
    }
    this.original = sanitized;
    this.tokens = [];
    this.pos = 0;
    this.tokenize();
  }

  tokenize() {
    let i = 0;
    const s = this.original;
    while (i < s.length) {
      if (this.isDigit(s[i]) || s[i] === ".") {
        let num = "";
        while (i < s.length && (this.isDigit(s[i]) || s[i] === ".")) {
          num += s[i++];
        }
        this.tokens.push({ type: "NUM", val: parseFloat(num) });
      } else if (this.isLetter(s[i])) {
        let word = "";
        while (i < s.length && this.isLetter(s[i])) {
          word += s[i++];
        }
        if (MathParser.MATH_FUNCTIONS.has(word)) {
          this.tokens.push({ type: "FUNC", val: word });
        } else if (word === "x") {
          this.tokens.push({ type: "VAR", val: "x" });
        } else if (word === "pi") {
          this.tokens.push({ type: "NUM", val: Math.PI });
        } else if (word === "e") {
          this.tokens.push({ type: "NUM", val: Math.E });
        } else {
          throw new Error(`Unknown identifier: ${word}`);
        }
      } else if ("+-*/^".includes(s[i])) {
        this.tokens.push({ type: "OP", val: s[i++] });
      } else if (s[i] === "(") {
        this.tokens.push({ type: "LPAREN" });
        i++;
      } else if (s[i] === ")") {
        this.tokens.push({ type: "RPAREN" });
        i++;
      } else {
        throw new Error(`Invalid character: ${s[i]}`);
      }

      if (i < s.length) {
        const prev = this.tokens[this.tokens.length - 1];
        const nextChar = s[i];
        const isPrevValue =
          prev.type === "NUM" || prev.type === "VAR" || prev.type === "RPAREN";
        const isNextValue =
          this.isDigit(nextChar) ||
          nextChar === "x" ||
          nextChar === "(" ||
          this.isLetter(nextChar);
        if (isPrevValue && isNextValue) {
          this.tokens.push({ type: "OP", val: "*" });
        }
      }
    }
    this.tokens.push({ type: "EOF" });
  }

  isDigit(c) {
    return c >= "0" && c <= "9";
  }
  isLetter(c) {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
  }
  peek() {
    return this.tokens[this.pos];
  }
  consume() {
    return this.tokens[this.pos++];
  }

  parse() {
    const ast = this.parseExpr();
    if (this.peek().type !== "EOF") throw new Error("Unexpected token at end");
    return ast;
  }

  parseExpr() {
    let node = this.parseTerm();
    while (
      this.peek().type === "OP" &&
      (this.peek().val === "+" || this.peek().val === "-")
    ) {
      const op = this.consume().val;
      node = new BinOpNode(op, node, this.parseTerm());
    }
    return node;
  }

  parseTerm() {
    let node = this.parsePower();
    while (
      this.peek().type === "OP" &&
      (this.peek().val === "*" || this.peek().val === "/")
    ) {
      const op = this.consume().val;
      node = new BinOpNode(op, node, this.parsePower());
    }
    return node;
  }

  parsePower() {
    let node = this.parseUnary();
    if (this.peek().type === "OP" && this.peek().val === "^") {
      this.consume();
      node = new BinOpNode("^", node, this.parsePower());
    }
    return node;
  }

  parseUnary() {
    if (
      this.peek().type === "OP" &&
      (this.peek().val === "+" || this.peek().val === "-")
    ) {
      const op = this.consume().val;
      const right = this.parseUnary();
      if (op === "-") return new BinOpNode("*", new NumberNode(-1), right);
      return right;
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    const t = this.peek();
    if (t.type === "NUM") {
      this.consume();
      return new NumberNode(t.val);
    }
    if (t.type === "VAR") {
      this.consume();
      return new VarNode();
    }
    if (t.type === "FUNC") {
      const funcName = this.consume().val;
      if (this.peek().type !== "LPAREN")
        throw new Error(`Expected '(' after function ${funcName}`);
      this.consume();
      const arg = this.parseExpr();
      if (this.peek().type !== "RPAREN")
        throw new Error(`Missing closing parenthesis for ${funcName}`);
      this.consume();
      return new FuncNode(funcName, arg);
    }
    if (t.type === "LPAREN") {
      this.consume();
      const node = this.parseExpr();
      if (this.peek().type !== "RPAREN")
        throw new Error("Missing closing parenthesis");
      this.consume();
      return node;
    }
    throw new Error("Unexpected token: " + JSON.stringify(t));
  }
}

class NumberNode {
  constructor(val) {
    this.val = val;
  }
  eval(x) {
    return this.val;
  }
  str(x) {
    return this.val.toString();
  }
}

class VarNode {
  eval(x) {
    return x;
  }
  str(x) {
    return x.toString();
  }
}

class BinOpNode {
  constructor(op, left, right) {
    this.op = op;
    this.left = left;
    this.right = right;
  }
  eval(x) {
    const l = this.left.eval(x);
    const r = this.right.eval(x);
    switch (this.op) {
      case "+":
        return l + r;
      case "-":
        return l - r;
      case "*":
        return l * r;
      case "/":
        return l / r;
      case "^":
        return Math.pow(l, r);
    }
  }
  str(x) {
    return `(${this.left.str(x)} ${this.op} ${this.right.str(x)})`;
  }
}

class FuncNode {
  static MATH_MAP = {
    sin: "sin",
    cos: "cos",
    tan: "tan",
    asin: "asin",
    acos: "acos",
    atan: "atan",
    sqrt: "sqrt",
    abs: "abs",
    exp: "exp",
    floor: "floor",
    ceil: "ceil",
    log: "log10",
    log10: "log10",
    log2: "log2",
    ln: "log",
  };
  constructor(name, arg) {
    this.name = name;
    this.arg = arg;
  }
  eval(x) {
    const argVal = this.arg.eval(x);
    const mathFunc = FuncNode.MATH_MAP[this.name];
    if (mathFunc && typeof Math[mathFunc] === "function")
      return Math[mathFunc](argVal);
    throw new Error(`Unknown math function: ${this.name}`);
  }
  str(x) {
    return `${this.name}(${this.arg.str(x)})`;
  }
}

class GraphEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.container = this.canvas.parentElement;
    this.scale = 40;
    this.offsetX = 0;
    this.offsetY = 0;
    this.showGrid = true;
    this.showLabels = true;
    this.functions = [];
    this.hoverX = null;
    this.hoverY = null;
    this.highlightFuncIndex = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.colors = [
      "#2979FF",
      "#00E676",
      "#FF3D00",
      "#FFEA00",
      "#D500F9",
      "#00E5FF",
    ];
    this.colorIndex = 0;
    this.calculusState = { limit: null, derivative: null, integral: null };
    this.resize();
    this.bindEvents();
    this.draw();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + "px";
    this.canvas.style.height = rect.height + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = rect.width;
    this.height = rect.height;
    this.draw();
  }

  bindEvents() {
    window.addEventListener("resize", () => this.resize());

    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const mathX = this.screenToMathX(mouseX);
      const mathY = this.screenToMathY(mouseY);
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.scale *= zoomFactor;
      this.scale = Math.max(5, Math.min(500, this.scale));
      this.offsetX = mouseX - mathX * this.scale;
      this.offsetY = mouseY + mathY * this.scale;
      this.draw();
      this.updateRangeInputs();
    });

    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.dragOffsetX = this.offsetX;
      this.dragOffsetY = this.offsetY;
      this.canvas.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;
        this.offsetX = this.dragOffsetX + dx;
        this.offsetY = this.dragOffsetY + dy;
        this.draw();
        this.updateRangeInputs();
      } else {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        if (
          mouseX >= 0 &&
          mouseX <= this.width &&
          mouseY >= 0 &&
          mouseY <= this.height
        ) {
          this.hoverX = this.screenToMathX(mouseX);
          this.hoverY = this.screenToMathY(mouseY);
          this.draw();
          this.showTooltip(mouseX, mouseY);
        } else {
          this.hoverX = null;
          this.hideTooltip();
        }
      }
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
      this.canvas.style.cursor = "crosshair";
    });

    let lastTouchDist = 0;
    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1) {
          this.isDragging = true;
          this.dragStartX = e.touches[0].clientX;
          this.dragStartY = e.touches[0].clientY;
          this.dragOffsetX = this.offsetX;
          this.dragOffsetY = this.offsetY;
        } else if (e.touches.length === 2) {
          lastTouchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY,
          );
        }
      },
      { passive: true },
    );

    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && this.isDragging) {
          const dx = e.touches[0].clientX - this.dragStartX;
          const dy = e.touches[0].clientY - this.dragStartY;
          this.offsetX = this.dragOffsetX + dx;
          this.offsetY = this.dragOffsetY + dy;
          this.draw();
          this.updateRangeInputs();
        } else if (e.touches.length === 2) {
          const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY,
          );
          const zoomFactor = dist / lastTouchDist;
          this.scale *= zoomFactor;
          this.scale = Math.max(5, Math.min(500, this.scale));
          lastTouchDist = dist;
          this.draw();
          this.updateRangeInputs();
        }
      },
      { passive: false },
    );

    this.canvas.addEventListener("touchend", () => {
      this.isDragging = false;
    });
  }

  mathToScreenX(x) {
    return x * this.scale + this.offsetX + this.width / 2;
  }
  mathToScreenY(y) {
    return -y * this.scale + this.offsetY + this.height / 2;
  }
  screenToMathX(px) {
    return (px - this.width / 2 - this.offsetX) / this.scale;
  }
  screenToMathY(py) {
    return -(py - this.height / 2 - this.offsetY) / this.scale;
  }

  getNiceStep(range) {
    const rough = range / 10;
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / pow;
    let nice;
    if (norm < 1.5) nice = 1;
    else if (norm < 3) nice = 2;
    else if (norm < 7) nice = 5;
    else nice = 10;
    return nice * pow;
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = "#20252D";
    ctx.fillRect(0, 0, this.width, this.height);

    const xMin = this.screenToMathX(0);
    const xMax = this.screenToMathX(this.width);
    const yMin = this.screenToMathY(this.height);
    const yMax = this.screenToMathY(0);
    const xStep = this.getNiceStep(xMax - xMin);
    const yStep = this.getNiceStep(yMax - yMin);

    if (this.showGrid) {
      ctx.strokeStyle = "#323945";
      ctx.lineWidth = 1;
      ctx.beginPath();
      let xStart = Math.floor(xMin / xStep) * xStep;
      for (let x = xStart; x <= xMax; x += xStep) {
        const px = this.mathToScreenX(x);
        ctx.moveTo(px, 0);
        ctx.lineTo(px, this.height);
      }
      let yStart = Math.floor(yMin / yStep) * yStep;
      for (let y = yStart; y <= yMax; y += yStep) {
        const py = this.mathToScreenY(y);
        ctx.moveTo(0, py);
        ctx.lineTo(this.width, py);
      }
      ctx.stroke();
    }

    const originX = this.mathToScreenX(0);
    const originY = this.mathToScreenY(0);
    ctx.strokeStyle = "#DCE2E8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (originY >= 0 && originY <= this.height) {
      ctx.moveTo(0, originY);
      ctx.lineTo(this.width, originY);
    }
    if (originX >= 0 && originX <= this.width) {
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, this.height);
    }
    ctx.stroke();

    if (this.showLabels) {
      ctx.fillStyle = "#9BA4B5";
      ctx.font = "11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      let xStartL = Math.floor(xMin / xStep) * xStep;
      for (let x = xStartL; x <= xMax; x += xStep) {
        if (Math.abs(x) < xStep * 0.01) continue;
        const px = this.mathToScreenX(x);
        const ly = Math.min(Math.max(originY + 5, 5), this.height - 15);
        ctx.fillText(this.formatNum(x), px, ly);
      }
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      let yStartL = Math.floor(yMin / yStep) * yStep;
      for (let y = yStartL; y <= yMax; y += yStep) {
        if (Math.abs(y) < yStep * 0.01) continue;
        const py = this.mathToScreenY(y);
        const lx = Math.min(Math.max(originX - 5, 30), this.width - 5);
        ctx.fillText(this.formatNum(y), lx, py);
      }
    }

    this.functions.forEach((func, idx) => {
      this.drawFunction(func, idx === this.highlightFuncIndex);
    });

    if (this.calculusState.integral) this.drawIntegralArea();
    if (this.calculusState.derivative) this.drawTangentLine();
    if (this.calculusState.limit) this.drawLimitIndicator();

    if (this.hoverX !== null && this.functions.length > 0) {
      const targetFunc =
        this.functions[this.highlightFuncIndex] || this.functions[0];
      try {
        const y = targetFunc.ast.eval(this.hoverX);
        if (isFinite(y)) {
          const px = this.mathToScreenX(this.hoverX);
          const py = this.mathToScreenY(y);
          ctx.strokeStyle = "rgba(41, 121, 255, 0.3)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(px, 0);
          ctx.lineTo(px, this.height);
          ctx.moveTo(0, py);
          ctx.lineTo(this.width, py);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#2979FF";
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#F8FAFC";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      } catch (e) {}
    }
  }

  drawFunction(func, isHighlighted) {
    const ctx = this.ctx;
    ctx.strokeStyle = func.color;
    ctx.lineWidth = isHighlighted ? 3 : 2;
    ctx.lineJoin = "round";
    if (isHighlighted) {
      ctx.shadowColor = func.color;
      ctx.shadowBlur = 8;
    }

    ctx.beginPath();
    let first = true;
    let prevY = null;
    const yMin = this.screenToMathY(this.height);
    const yMax = this.screenToMathY(0);
    const yRange = yMax - yMin;
    const threshold = yRange * 2;

    for (let px = 0; px < this.width; px += 1) {
      const mathX = this.screenToMathX(px);
      try {
        const mathY = func.ast.eval(mathX);
        if (!isFinite(mathY)) {
          first = true;
          continue;
        }
        if (mathY > yMax + threshold || mathY < yMin - threshold) {
          first = true;
          continue;
        }
        const py = this.mathToScreenY(mathY);
        if (prevY !== null && Math.abs(py - prevY) > this.height * 0.8) {
          first = true;
        }
        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          ctx.lineTo(px, py);
        }
        prevY = py;
      } catch (e) {
        first = true;
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  drawTangentLine() {
    if (!this.calculusState.derivative) return;
    const { x, funcIndex } = this.calculusState.derivative;
    const func = this.functions[funcIndex];
    if (!func) return;

    const ctx = this.ctx;
    const h = Math.max(1e-7, Math.abs(x) * 1e-12);
    let y, dy;
    try {
      y = func.ast.eval(x);
      dy = (func.ast.eval(x + h) - func.ast.eval(x - h)) / (2 * h);
    } catch (e) {
      return;
    }
    if (!isFinite(y) || !isFinite(dy)) return;

    ctx.save();
    ctx.strokeStyle = "#FFEA00";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    const xMin = this.screenToMathX(0);
    const xMax = this.screenToMathX(this.width);
    const startY = dy * (xMin - x) + y;
    const endY = dy * (xMax - x) + y;
    ctx.moveTo(this.mathToScreenX(xMin), this.mathToScreenY(startY));
    ctx.lineTo(this.mathToScreenX(xMax), this.mathToScreenY(endY));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#FFEA00";
    ctx.beginPath();
    ctx.arc(this.mathToScreenX(x), this.mathToScreenY(y), 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawIntegralArea() {
    if (!this.calculusState.integral) return;
    const { a, b, funcIndex } = this.calculusState.integral;
    const func = this.functions[funcIndex];
    if (!func) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = "rgba(41, 121, 255, 0.2)";
    ctx.strokeStyle = "rgba(41, 121, 255, 0.6)";
    ctx.lineWidth = 1;

    const steps = 200;
    const dx = (b - a) / steps;

    ctx.beginPath();
    ctx.moveTo(this.mathToScreenX(a), this.mathToScreenY(0));
    for (let i = 0; i <= steps; i++) {
      const currX = a + i * dx;
      try {
        const currY = func.ast.eval(currX);
        if (isFinite(currY))
          ctx.lineTo(this.mathToScreenX(currX), this.mathToScreenY(currY));
      } catch (e) {}
    }
    ctx.lineTo(this.mathToScreenX(b), this.mathToScreenY(0));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawLimitIndicator() {
    if (!this.calculusState.limit) return;
    const { c, funcIndex } = this.calculusState.limit;
    const func = this.functions[funcIndex];
    if (!func) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = "#00E676";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);

    const px = this.mathToScreenX(c);
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, this.height);
    ctx.stroke();
    ctx.setLineDash([]);

    const h = Math.max(1e-7, Math.abs(c) * 1e-12);
    let leftLim, rightLim;
    try {
      leftLim = func.ast.eval(c - h);
    } catch (e) {}
    try {
      rightLim = func.ast.eval(c + h);
    } catch (e) {}

    if (isFinite(leftLim)) {
      ctx.fillStyle = "#00E676";
      ctx.beginPath();
      ctx.arc(px, this.mathToScreenY(leftLim), 5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (isFinite(rightLim)) {
      ctx.fillStyle = "#00E676";
      ctx.beginPath();
      ctx.arc(px, this.mathToScreenY(rightLim), 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  formatNum(n) {
    if (Number.isInteger(n)) return n.toString();
    return parseFloat(n.toPrecision(4)).toString();
  }

  showTooltip(mx, my) {
    const tooltip = document.getElementById("tooltip");
    if (this.functions.length === 0) {
      tooltip.classList.remove("visible");
      return;
    }
    const targetFunc =
      this.functions[this.highlightFuncIndex] || this.functions[0];
    try {
      const y = targetFunc.ast.eval(this.hoverX);
      if (isFinite(y)) {
        tooltip.innerHTML = `x: ${this.formatNum(this.hoverX)}<br>y: ${this.formatNum(y)}`;
        tooltip.style.left = mx + 15 + "px";
        tooltip.style.top = my - 30 + "px";
        tooltip.classList.add("visible");
      } else {
        tooltip.classList.remove("visible");
      }
    } catch (e) {
      tooltip.classList.remove("visible");
    }
  }

  hideTooltip() {
    document.getElementById("tooltip").classList.remove("visible");
  }

  updateRangeInputs() {
    document.getElementById("xMin").value =
      Math.round(this.screenToMathX(0) * 10) / 10;
    document.getElementById("xMax").value =
      Math.round(this.screenToMathX(this.width) * 10) / 10;
    document.getElementById("yMin").value =
      Math.round(this.screenToMathY(this.height) * 10) / 10;
    document.getElementById("yMax").value =
      Math.round(this.screenToMathY(0) * 10) / 10;
  }

  setRange(xMin, xMax, yMin, yMax) {
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    this.scale = Math.min(this.width / xRange, this.height / yRange);
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;
    this.offsetX = -centerX * this.scale;
    this.offsetY = centerY * this.scale;
    this.draw();
  }

  resetView() {
    this.scale = 40;
    this.offsetX = 0;
    this.offsetY = 0;
    this.draw();
    this.updateRangeInputs();
  }

  addFunction(expr) {
    const parser = new MathParser(expr);
    const ast = parser.parse();
    const color = this.colors[this.colorIndex % this.colors.length];
    this.colorIndex++;
    this.functions.push({ expr, ast, color });
    this.highlightFuncIndex = this.functions.length - 1;
    this.draw();
    this.updateLegend();
  }

  removeFunction(index) {
    this.functions.splice(index, 1);
    if (this.highlightFuncIndex >= this.functions.length) {
      this.highlightFuncIndex = Math.max(0, this.functions.length - 1);
    }
    this.draw();
    this.updateLegend();
  }

  updateLegend() {
    const legend = document.getElementById("legend");
    legend.innerHTML = "";
    this.functions.forEach((func, idx) => {
      const item = document.createElement("div");
      item.className = "legend-item";
      item.innerHTML = `<div class="legend-color" style="background:${func.color}"></div><span>y = ${func.expr}</span>`;
      item.style.cursor = "pointer";
      item.onclick = () => {
        this.highlightFuncIndex = idx;
        this.draw();
        document.querySelectorAll(".func-item").forEach((el, i) => {
          el.style.borderColor = i === idx ? "#2979FF" : "#323945";
        });
      };
      legend.appendChild(item);
    });
  }
}

class App {
  constructor() {
    this.graph = new GraphEngine("graphCanvas");
  }

  bindUI() {
    const funcInput = document.getElementById("funcInput");
    const addBtn = document.getElementById("addFuncBtn");
    const xInput = document.getElementById("xInput");
    const resetBtn = document.getElementById("resetBtn");
    const toggleGrid = document.getElementById("toggleGrid");
    const toggleLabels = document.getElementById("toggleLabels");
    const xMin = document.getElementById("xMin");
    const xMax = document.getElementById("xMax");
    const yMin = document.getElementById("yMin");
    const yMax = document.getElementById("yMax");

    addBtn.addEventListener("click", () => this.addFunction());
    funcInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addFunction();
    });
    xInput.addEventListener("input", () => this.calculate());

    resetBtn.addEventListener("click", () => {
      this.graph.functions = [];
      this.graph.colorIndex = 0;
      this.graph.resetView();
      this.graph.updateLegend();
      this.renderFuncList();
      this.initDefault();
    });

    toggleGrid.addEventListener("change", (e) => {
      this.graph.showGrid = e.target.checked;
      this.graph.draw();
    });
    toggleLabels.addEventListener("change", (e) => {
      this.graph.showLabels = e.target.checked;
      this.graph.draw();
    });

    const updateRange = () => {
      const x1 = parseFloat(xMin.value),
        x2 = parseFloat(xMax.value);
      const y1 = parseFloat(yMin.value),
        y2 = parseFloat(yMax.value);
      if (
        !isNaN(x1) &&
        !isNaN(x2) &&
        !isNaN(y1) &&
        !isNaN(y2) &&
        x1 < x2 &&
        y1 < y2
      ) {
        this.graph.setRange(x1, x2, y1, y2);
      }
    };
    [xMin, xMax, yMin, yMax].forEach((el) =>
      el.addEventListener("change", updateRange),
    );

    document.querySelectorAll(".preset-btns .btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        funcInput.value = btn.dataset.preset;
        this.addFunction();
      });
    });

    this.bindCalculusUI();
  }

  addFunction() {
    const input = document.getElementById("funcInput");
    let expr = input.value.trim();
    if (expr.toLowerCase().startsWith("y=")) expr = expr.substring(2).trim();
    if (expr.toLowerCase().startsWith("y =")) expr = expr.substring(3).trim();
    if (!expr) return;

    const normalizedExpr = expr.replace(/\s+/g, "").toLowerCase();
    const isDuplicate = this.graph.functions.some(
      (f) => f.expr.replace(/\s+/g, "").toLowerCase() === normalizedExpr,
    );

    if (isDuplicate) {
      alert(`Function "${expr}" already exists in the list.`);
      return;
    }

    try {
      const parser = new MathParser(expr);
      const ast = parser.parse();

      const testPoints = [-100, -10, -1, 0, 1, 10, 100];
      const results = testPoints.map((x) => {
        try {
          return ast.eval(x);
        } catch (e) {
          return NaN;
        }
      });

      const allInvalid = results.every((r) => !isFinite(r));
      if (allInvalid) {
        alert(
          `Function "${expr}" produces invalid values (Infinity/NaN) at all test points.`,
        );
        return;
      }

      this.graph.addFunction(expr);
      this.renderFuncList();
      this.calculate();
      input.value = "";
      input.focus();
    } catch (e) {
      alert(
        `Invalid expression: ${e.message}\nPlease use valid algebraic syntax (e.g., sin(x), 2x + 3, x^2 - 4).`,
      );
    }
  }

  renderFuncList() {
    const list = document.getElementById("funcList");
    list.innerHTML = "";
    this.graph.functions.forEach((func, idx) => {
      const item = document.createElement("div");
      item.className = "func-item";
      if (idx === this.graph.highlightFuncIndex)
        item.style.borderColor = "#2979FF";
      item.innerHTML = `<div class="func-item-left"><div class="func-color" style="background:${func.color}"></div><span class="func-expr">y = ${func.expr}</span></div><button class="func-remove" data-idx="${idx}">&times;</button>`;
      item.querySelector(".func-remove").addEventListener("click", (e) => {
        e.stopPropagation();
        this.graph.removeFunction(idx);
        this.renderFuncList();
        this.calculate();
      });
      item.addEventListener("click", () => {
        this.graph.highlightFuncIndex = idx;
        this.graph.draw();
        this.renderFuncList();
        this.calculate();
      });
      list.appendChild(item);
    });
  }

  calculate() {
    const xInput = document.getElementById("xInput");
    const xVal = parseFloat(xInput.value);
    const stepEq = document.getElementById("stepEq");
    const stepSub = document.getElementById("stepSub");
    const stepRes = document.getElementById("stepRes");

    if (this.graph.functions.length === 0) {
      stepEq.textContent = "Enter a function to calculate.";
      stepSub.textContent = "";
      stepRes.textContent = "";
      return;
    }
    const func = this.graph.functions[this.graph.highlightFuncIndex];
    if (isNaN(xVal)) {
      stepEq.textContent = `y = ${func.expr}`;
      stepSub.textContent = "Enter a valid number for x.";
      stepRes.textContent = "";
      return;
    }
    try {
      const yVal = func.ast.eval(xVal);
      stepEq.textContent = `y = ${func.expr}`;
      stepSub.textContent = `y = ${func.ast.str(xVal)}`;
      if (isFinite(yVal)) {
        const roundedY = Math.round(yVal * 1000000) / 1000000;
        stepRes.textContent = `y = ${roundedY}  →  Point (${xVal}, ${roundedY})`;
      } else {
        stepRes.textContent = `y = Undefined (Asymptote)`;
      }
    } catch (e) {
      stepRes.textContent = "Error calculating value.";
    }
  }

  bindCalculusUI() {
    const limitX = document.getElementById("limitX");
    const derivX = document.getElementById("derivX");
    const intA = document.getElementById("intA");
    const intB = document.getElementById("intB");

    const updateCalculusCalculations = () => {
      const idx = this.graph.highlightFuncIndex;
      if (this.graph.functions.length === 0 || !this.graph.functions[idx]) {
        this.graph.calculusState = {
          limit: null,
          derivative: null,
          integral: null,
        };
        this.graph.draw();
        document.getElementById("limitResult").textContent =
          "Select a function from the list first.";
        document.getElementById("derivResult").textContent =
          "Select a function from the list first.";
        document.getElementById("intResult").textContent =
          "Select a function from the list first.";
        return;
      }

      const func = this.graph.functions[idx];

      const cLim = parseFloat(limitX.value);
      if (!isNaN(cLim)) {
        this.graph.calculusState.limit = { c: cLim, funcIndex: idx };
        const epsilon = Math.max(1e-7, Math.abs(cLim) * 1e-12);

        let lL, rL;
        try {
          lL = func.ast.eval(cLim - epsilon);
        } catch (e) {}
        try {
          rL = func.ast.eval(cLim + epsilon);
        } catch (e) {}

        const res = document.getElementById("limitResult");

        if (Math.abs(cLim) > 1e5) {
          const testVals = [
            cLim - 1000,
            cLim - 100,
            cLim - 10,
            cLim,
            cLim + 10,
            cLim + 100,
            cLim + 1000,
          ];
          const results = testVals.map((x) => {
            try {
              return func.ast.eval(x);
            } catch (e) {
              return NaN;
            }
          });

          const finiteResults = results.filter((r) => isFinite(r));
          const isOscillating =
            results.some((r) => !isFinite(r)) ||
            (finiteResults.length > 2 &&
              Math.max(...finiteResults) - Math.min(...finiteResults) > 100);

          if (isOscillating) {
            res.textContent = "Indeterminate / Oscillation at Infinity";
            this.graph.draw();
            return;
          }
        }

        if (isFinite(lL) && isFinite(rL) && Math.abs(lL - rL) < epsilon * 100) {
          res.textContent = `lim = ${Math.round(lL * 10000) / 10000}`;
        } else {
          res.textContent = `Limit DNE (L: ${isFinite(lL) ? lL.toFixed(4) : "undef"}, R: ${isFinite(rL) ? rL.toFixed(4) : "undef"})`;
        }
      } else {
        this.graph.calculusState.limit = null;
        document.getElementById("limitResult").textContent =
          "Select a function and enter x value.";
      }

      const cDer = parseFloat(derivX.value);
      if (!isNaN(cDer)) {
        this.graph.calculusState.derivative = { x: cDer, funcIndex: idx };
        const h = Math.max(1e-7, Math.abs(cDer) * 1e-12);
        let dy;
        try {
          dy = (func.ast.eval(cDer + h) - func.ast.eval(cDer - h)) / (2 * h);
        } catch (e) {}
        const res = document.getElementById("derivResult");
        if (isFinite(dy)) {
          res.textContent = `f'(${cDer}) = ${Math.round(dy * 10000) / 10000}`;
        } else {
          res.textContent = "Derivative undefined.";
        }
      } else {
        this.graph.calculusState.derivative = null;
        document.getElementById("derivResult").textContent =
          "Select a function and enter x value.";
      }

      const valA = parseFloat(intA.value);
      const valB = parseFloat(intB.value);
      if (!isNaN(valA) && !isNaN(valB) && valA !== valB) {
        const a = valA;
        const b = valB;

        this.graph.calculusState.integral = {
          a: Math.min(a, b),
          b: Math.max(a, b),
          funcIndex: idx,
        };

        const n = 1000;
        const dx = (b - a) / n;
        let sum = 0;
        try {
          sum += func.ast.eval(a);
          sum += func.ast.eval(b);
          for (let i = 1; i < n; i++) {
            const x = a + i * dx;
            const y = func.ast.eval(x);
            sum += (i % 2 === 0 ? 2 : 4) * y;
          }
          sum *= dx / 3;
        } catch (e) {}

        const res = document.getElementById("intResult");
        if (isFinite(sum)) {
          res.textContent = `∫ = ${Math.round(sum * 10000) / 10000}`;
        } else {
          res.textContent = "Integral undefined.";
        }
      } else {
        this.graph.calculusState.integral = null;
        document.getElementById("intResult").textContent =
          "Select a function and enter bounds.";
      }
      this.graph.draw();
    };

    [limitX, derivX, intA, intB].forEach((el) =>
      el.addEventListener("input", updateCalculusCalculations),
    );

    const origRemove = this.graph.removeFunction.bind(this.graph);
    this.graph.removeFunction = (index) => {
      origRemove(index);
      updateCalculusCalculations();
    };

    const origHighlight = this.graph.highlightFuncIndex;
    Object.defineProperty(this.graph, "highlightFuncIndex", {
      get: function () {
        return this._highlightFuncIndex !== undefined
          ? this._highlightFuncIndex
          : 0;
      },
      set: function (val) {
        this._highlightFuncIndex = val;
        updateCalculusCalculations();
      },
      configurable: true,
    });
    this.graph._highlightFuncIndex = origHighlight;
  }

  initDefault() {
    const funcInput = document.getElementById("funcInput");
    funcInput.value = "x^2 - 4";
    this.addFunction();
    funcInput.value = "sin(x)";
    this.addFunction();
    funcInput.value = "";
    this.calculate();
  }
}

class Loader {
  constructor() {
    this.el = document.getElementById("loading-screen");
    this.bar = document.getElementById("loader-progress-bar");
    this.percent = document.getElementById("loader-percent");
    this.status = document.getElementById("loader-status");
  }
  update(progress, statusText) {
    this.bar.style.width = progress + "%";
    this.percent.textContent = progress + "%";
    if (statusText) this.status.textContent = statusText;
  }
  hide() {
    this.el.classList.add("fade-out");
    setTimeout(() => {
      if (this.el && this.el.parentNode)
        this.el.parentNode.removeChild(this.el);
    }, 600);
  }
}

const wait = (ms) => new Promise((res) => setTimeout(res, ms));
document.addEventListener("DOMContentLoaded", async () => {
  const loader = new Loader();
  loader.update(15, "Initializing coordinate system...");
  await wait(500);
  const app = new App();
  loader.update(45, "Binding interactive controls...");
  await wait(500);
  app.bindUI();
  loader.update(75, "Parsing algebraic functions...");
  await wait(500);
  app.initDefault();
  loader.update(100, "Graph ready.");
  await wait(500);
  loader.hide();
});
