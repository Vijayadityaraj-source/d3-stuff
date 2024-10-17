(()=>{
    const score = 8.5;
    const width = 500;
    const height = 500;

    const creditSegments = ["Low", "Good", "Excellent"];
        // var total = data.length

        const svg = d3.create("svg")
        .attr("width",width)
        .attr("height",height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");
    
        // const cumm = [0]
        // for(var i=0;i<SegData.length;i++){
        //     var x = 0;
        //     for(var j=i;j>=0;j--){
        //         x+=SegData[j].value;
        //     }
        //     cumm.push(x)
        // }

        // for(var i=1;i<cumm.length;i++){
        //     svg.append("path")
        //     .attr("transform", "translate(200,350)")
        //     .attr("d", d3.arc()({
        //       innerRadius: 100,
        //       outerRadius: 200,
        //       startAngle: (- Math.PI /2) + ((cumm[i-1]/total)*Math.PI),
        //       endAngle: (- Math.PI /2) + ((cumm[i]/total)*Math.PI),
        //       padAngle: 0,
        //       cornerRadius: 20
        //     }))
        //     .attr("fill",()=>{
        //         if(SegData[i-1].key==="Low") return "#FE0000"
        //         else if(SegData[i-1].key==="Good") return "#FFCC33"
        //         else if(SegData[i-1].key==="Excellent") return "#01CC34"
        //     })
        //     .attr("id","arc"+SegData[i-1].key)
        //     .append("title")
        //     .text(SegData[i-1].key)
        // }

        const scale = d3.scaleLinear()
            .domain([0, 10])
            .range([-Math.PI/2, Math.PI/2]);

        const score_range = [0,3,7,10]
        console.log(scale(score_range[3]))

        for(var i=1;i<score_range.length;i++){
            svg.append("path")
                .attr("transform", "translate(200,350)")
                .attr("d", d3.arc()({
                  innerRadius: 100,
                  outerRadius: 200,
                  startAngle: scale(score_range[i-1]),
                  endAngle: scale(score_range[i]),
                  padAngle: 0,
                  cornerRadius: 20
                }))
                .attr("fill",()=>{
                    if(creditSegments[i-1]==="Low") return "#FE0000"
                    else if(creditSegments[i-1]==="Good") return "#FFCC33"
                    else if(creditSegments[i-1]==="Excellent") return "#01CC34"
                })
                .attr("id","arc"+creditSegments[i-1].key)
                .append("title")
                .text(creditSegments[i-1].key)
        }

        const radius = 20;

        svg.append("circle")
        .attr("cx",200)
        .attr("cy",350)
        .attr("r",radius)
        .attr("fill","black")

        svg.append("circle")
        .attr("cx",200)
        .attr("cy",350)
        .attr("r",radius/2)
        .attr("fill","grey")

        const needleLength = 200 * 0.7; //outerRadius *0.7
        const needleWidth = 20;

        const needlePath = d3.path();
        needlePath.moveTo(-needleWidth , 0);           // Bottom-left
        needlePath.lineTo(needleWidth , 0);            // Bottom-right
        needlePath.lineTo(needleWidth / 1000, -needleLength); // Top-right (needle tip)
        needlePath.lineTo(-needleWidth / 1000, -needleLength);// Top-left (needle tip)
        needlePath.closePath();

        const needle = svg.append("path")
        .attr("d", needlePath.toString())
        .attr("fill", "black")
        .attr("transform", "translate(200,350) rotate(-90)")
        .style("transition", "transform 0.8s ease")

        function UpdateNeedle(score){
            const scale = d3.scaleLinear()
            .domain([0, 10]) // Credit score range
            .range([-90, 90]);  // Needle angle range (in degrees)
    
            const angle = scale(score);

            needle.transition()
            .duration(1500)
            .attr("transform", `translate(200,350) rotate(${angle})`)

            // svg.append("text")
            // .attr("dx","100")
            // .attr("dy","100")
            // .attr("text-achor","middle")
            // .style("font-size", "16px")     // Set the font size
            // .style("font-family", "Arial")  // Set the font type (you can choose any font)
            // .style("fill", "blue") 
            // .append("textPath")
            // // .attr("href", "#arc" + SegData[i-1].key)
            // // .attr("startOffset", "50%")
            // .text(`${score}`)

            const mypath = d3.path()
            mypath.moveTo(20,20)
            mypath.bezierCurveTo(80,60,100,40,120,20)

            const pathsvg = svg.append("path")
            .attr("d",mypath.toString())
            .attr("id","my_path")
            .attr("fill","transparent");

            svg.append("text")
            .attr("font-family", "Arial")  // Font family
            .attr("font-size", "24px")  // Font size
            .attr("fill", "black")  // Text color
            .style("dominant-baseline","hanging")
            .append("textPath")
            .attr("href","#my_path")
            .text(`Score : ${score}`);
        }

        d3.select("body").append(()=>svg.node())
        UpdateNeedle(score)
})()