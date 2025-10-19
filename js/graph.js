

//     NORMALISATION
//    Convert user-friendly math into valid JS
//    Handles logs, roots, constants, trig, and
//    implicit multiplication like "2x".     
function normalize(expr){
        let e=expr;

        // Logs and roots
        e = e.replace(/ln\(/g,"Math.log(");
        e = e.replace(/log\(/g,"Math.log10(");
        e = e.replace(/sqrt\(/g,"Math.sqrt(");
        e = e.replace(/\^/g,"**");
        e = e.replace(/π/g,"Math.PI");

        // Exponential and trig
        e = e.replace(/\be\b/g,"Math.E");
        e = e.replace(/sin\(/g,"Math.sin(");
        e = e.replace(/cos\(/g,"Math.cos(");
        e = e.replace(/tan\(/g,"Math.tan(");

        // Implicit multiplication
        e = e.replace(/(\d)(x)/g, "$1*$2");
        e = e.replace(/x\(/g, "x*(");
        e = e.replace(/\)(\d|x)/g, ")*$1");

        return e;
}

// PLOT FUNCTION
//    - Reads user input
//    - Normalises expression
//    - Samples y values in range [xMin,xMax]
//    - Renders with Plotly

function plotGraph(){

        // Gather user inputs
        const expr = document.getElementById("expr").value;
        const xMin = parseFloat(document.getElementById("xMin").value);
        const xMax = parseFloat(document.getElementById("xMax").value);
        const step = parseFloat(document.getElementById("step").value);

        // Translate expressions into JS
        const jsExpr = normalize(expr);
        const f = Function("x","return "+jsExpr);

        // sample function values
        const xs = [], ys=[];
        for(let x=xMin; x<=xMax; x+=step){
                xs.push(x);
                try{ys.push(f(x));}catch{ys.push(NaN);}
        }

        // Ploty graph render
        Plotly.newPlot("plot",
                [{x:xs,y:ys,mode:"lines",line:{color:"#0f0"}}],
                {paper_bgcolor:"#000",plot_bgcolor:"#000",
                xaxis:{color:"#0f0"},yaxis:{color:"#0f0"}},
                {displayModeBar:false}

        );
}

document.getElementById("plotBtn").onclick=plotGraph;
document.getElementById("backBtn").onclick=()=>window.location.href="index.html";

plotGraph();

       