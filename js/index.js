

let str = "0";
const screen = document.querySelector(".screen");

function show(v) { str = v; screen.value = v; }
function add(ch) {

        // Avoid leading "0x" patterns
        if (str === "0") str = "";
        str += ch;
        screen.value = str;

}
function back() {
        // safe backspace : if last char removed, snap back to "0"
        if (str.length > 1) { str = str.slice(0, -1); screen.value = str; }
        else { show("0"); }
}

function clearAll() { show("0"); }

// toggle affects the leading sign; avoids corrupting inner sub-expression
function toggleSign() {
        if (str.startsWith("-")) show(str.slice(1));
        else show("-" + str);
}

// Angle mode
function isDeg() { return document.getElementById("deg").checked; }
function toRad(x) { return x * Math.PI / 180; }
function toDeg(x) { return x * 180 / Math.PI; }


// normalisation, Translate student-friendly math into js-safe syntax
// route trig through wrappers so Deg/Rad is enforced uniformly
function normalize(expr) {
        let e = expr;

        // Natural names - Math.*(logs,roots)
        e = e.replace(/ln\(/g, "Math.log(");
        e = e.replace(/log\(/g, "Math.log10(");
        e = e.replace(/sqrt\(/g, "Math.sqrt(");

        // Trig and Inverse trig ratios
        e = e.replace(/sin⁻¹\(/g, "ASIN(");
        e = e.replace(/cos⁻¹\(/g, "ACOS(");
        e = e.replace(/tan⁻¹\(/g, "ATAN(");
        e = e.replace(/sin\(/g, "SIN(");
        e = e.replace(/cos\(/g, "COS(");
        e = e.replace(/tan\(/g, "TAN(");

        // Operators and literals
        e = e.replace(/\^/g, "**");
        e = e.replace(/sq/g, "**2");
        e = e.replace(/(\d+(\.\d+)?)%/g, "($1/100)");

        // Math constants
        e = e.replace(/π/g, "Math.PI");
        e = e.replace(/\be\b/g, "Math.E");

        return e;
}

function calculate() {
        try {
                const jsExpr = normalize(str);

                // Environment expose approved functions
                const env = {
                        Math,

                        // Trig wrappers convert inputs/outputs depending on mode
                        SIN: (x) => isDeg() ? Math.sin(toRad(x)) : Math.sin(x),
                        COS: (x) => isDeg() ? Math.cos(toRad(x)) : Math.cos(x),
                        TAN: (x) => isDeg() ? Math.tan(toRad(x)) : Math.tan(x),
                        ASIN: (x) => isDeg() ? toDeg(Math.asin(x)) : Math.asin(x),
                        ACOS: (x) => isDeg() ? toDeg(Math.acos(x)) : Math.acos(x),
                        ATAN: (x) => isDeg() ? toDeg(Math.atan(x)) : Math.atan(x)
                };

                // Execute expression "within" env only
                const out = Function("with(this){ return " + jsExpr + " }").call(env);
                show(String(out));
        } catch {
                show("Error");
        }
}
for (let i = 0; i <= 9; i++) {
        document.getElementById("btn-" + i).onclick = () => add(String(i));
}

// operators
document.getElementById("btn-plus").onclick = () => add("+");
document.getElementById("btn-minus").onclick = () => add("-");
document.getElementById("btn-multiply").onclick = () => add("*");
document.getElementById("btn-divide").onclick = () => add("/");
document.getElementById("btn-power").onclick = () => add("^");
document.getElementById("btn-percentage").onclick = () => add("%");


document.getElementById("btn-dot").onclick = () => add(".");
document.getElementById("btn-left-bracket").onclick = () => add(".");
document.getElementById("btn-right-bracket").onclick = () => add(")");
document.getElementById("btn-plus-minus").onclick = () => toggleSign;

// Functions
document.getElementById("btn-sqrt").onclick = () => add("sqrt(");
document.getElementById("btn-sq").onclick = () => add("sq");
document.getElementById("btn-log").onclick = () => add("log(");
document.getElementById("btn-ln").onclick = () => add("ln(");
document.getElementById("btn-sin").onclick = () => add("sin(");
document.getElementById("btn-cos").onclick = () => add("cos(");
document.getElementById("btn-tan").onclick = () => add("tan(");
document.getElementById("btn-sin-inv").onclick = () => add("sin⁻¹(");
document.getElementById("btn-cos-inv").onclick = () => add("cos⁻¹(");
document.getElementById("btn-tan-inv").onclick = () => add("tan⁻¹(");

// constants
document.getElementById("btn-pi").onclick = () => add("π");
document.getElementById("btn-euler").onclick = () => add("e");

document.getElementById("btn-clear").onclick = clearAll;
document.getElementById("btn-cancel").onclick = back;
document.getElementById("btn-redo").onclick = back;
document.getElementById("btn-ok").onclick = calculate;

// Navigation (modular app: graphing and AI live as seperate pages)
document.getElementById("btn-graph").onclick = () => { window.location.href = "graph.html"; };
document.getElementById("btn-ai").onclick = () => { window.location.href = "AI.html"; };

// initial point
show("0")
